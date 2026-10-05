#!/usr/bin/env bash
# Deploy UI (site root) + API (/api) to Azure App Service.
# Publish password lives in .azure-publish (gitignored). On 401 the script asks for a new one.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CRED="$ROOT/.azure-publish"
PUBLISH_DIR="$ROOT/publish"
ZIP="$ROOT/deploy.zip"
SECRETS="$HOME/.microsoft/usersecrets/8f3c1a2e-9d4b-4e71-a6c8-2b1f0e7d5c94/secrets.json"

AZURE_SCM_HOST="${AZURE_SCM_HOST:-plantyhubsite-fpg0ctgyfdcya9cx.scm.westeurope-01.azurewebsites.net}"
AZURE_PUBLISH_USER="${AZURE_PUBLISH_USER:-\$PlantyHubSite}"
AZURE_SITE_URL="${AZURE_SITE_URL:-https://plantyhubsite-fpg0ctgyfdcya9cx.westeurope-01.azurewebsites.net}"

load_cred() {
  if [[ -f "$CRED" ]]; then
    # shellcheck disable=SC1090
    source "$CRED"
  fi
}

save_cred() {
  umask 077
  cat >"$CRED" <<EOF
AZURE_SCM_HOST=$(printf '%q' "$AZURE_SCM_HOST")
AZURE_PUBLISH_USER=$(printf '%q' "$AZURE_PUBLISH_USER")
AZURE_PUBLISH_PASSWORD=$(printf '%q' "$AZURE_PUBLISH_PASSWORD")
AZURE_SITE_URL=$(printf '%q' "$AZURE_SITE_URL")
EOF
}

parse_profile() {
  local raw="$1"
  local host user pass site
  host="$(printf '%s' "$raw" | sed -n 's/.*publishUrl="\([^"]*scm[^"]*\)".*/\1/p' | head -1)"
  host="${host%%:*}"
  user="$(printf '%s' "$raw" | sed -n 's/.*userName="\([^"]*\)".*/\1/p' | head -1)"
  pass="$(printf '%s' "$raw" | sed -n 's/.*userPWD="\([^"]*\)".*/\1/p' | head -1)"
  site="$(printf '%s' "$raw" | sed -n 's/.*destinationAppUrl="\([^"]*\)".*/\1/p' | head -1)"
  [[ -n "$host" ]] && AZURE_SCM_HOST="$host"
  [[ -n "$user" ]] && AZURE_PUBLISH_USER="$user"
  [[ -n "$pass" ]] && AZURE_PUBLISH_PASSWORD="$pass"
  [[ -n "$site" ]] && AZURE_SITE_URL="$site"
}

ask_password() {
  local raw=""
  echo
  echo "Paste the Zip Deploy / Web Deploy password, or the whole publish profile XML, then Enter:"
  IFS= read -r raw </dev/tty || true
  raw="${raw%$'\r'}"
  if [[ "$raw" == *userPWD=* ]]; then
    parse_profile "$raw"
  else
    AZURE_PUBLISH_PASSWORD="$raw"
  fi
  if [[ -z "${AZURE_PUBLISH_PASSWORD:-}" ]]; then
    echo "No password given." >&2
    exit 1
  fi
  save_cred
  echo "Saved publish login to $CRED"
}

ensure_password() {
  load_cred
  if [[ -z "${AZURE_PUBLISH_PASSWORD:-}" ]]; then
    ask_password
  fi
}

build() {
  echo "→ Building UI"
  # Optional, baked into the UI: VITE_GA_MEASUREMENT_ID, VITE_GTM_ID, VITE_META_PIXEL_ID, VITE_CLARITY_PROJECT_ID.
  (cd "$ROOT/plantyhub.ui" && npx vite build)

  echo "→ Publishing API"
  (cd "$ROOT/PlantyHub.Api" && dotnet publish -c Release -o "$PUBLISH_DIR" --nologo)

  mkdir -p "$PUBLISH_DIR/wwwroot"
  rsync -a --delete "$ROOT/plantyhub.ui/dist/" "$PUBLISH_DIR/wwwroot/"

  python3 - <<PY
import json
from pathlib import Path

root = Path("$ROOT")
secrets_path = Path("$SECRETS")
if not secrets_path.exists():
    raise SystemExit(f"Missing user-secrets at {secrets_path}")

secrets = json.loads(secrets_path.read_text(encoding="utf-8-sig"))
dev = json.loads((root / "PlantyHub.Api" / "appsettings.Development.json").read_text(encoding="utf-8-sig"))
prod = {
    "ConnectionStrings": {
        "DefaultConnection": secrets["ConnectionStrings:DefaultConnection"],
    },
    "Jwt": {"Key": dev.get("Jwt", {}).get("Key", "PlantyHub-Dev-Secret-Key-At-Least-32-Chars-Long!")},
    "App": {"FrontendUrl": "$AZURE_SITE_URL"},
    "R2": {
        "AccountId": secrets.get("R2:AccountId", ""),
        "AccessKeyId": secrets.get("R2:AccessKeyId", ""),
        "SecretAccessKey": secrets.get("R2:SecretAccessKey", ""),
        "BucketName": secrets.get("R2:BucketName", "plantyhub"),
        "PublicBaseUrl": secrets.get("R2:PublicBaseUrl", "https://media.plantyhub.com"),
    },
    "Email": {
        "ConnectionString": secrets.get("Email:ConnectionString", ""),
    },
}
(root / "publish" / "appsettings.Production.json").write_text(json.dumps(prod, indent=2), encoding="utf-8")
PY

  python3 - <<PY
from pathlib import Path
p = Path("$PUBLISH_DIR") / "web.config"
if p.exists():
    p.write_text(p.read_text().replace('stdoutLogEnabled="false"', 'stdoutLogEnabled="true"'))
PY

  rm -f "$ZIP"
  (cd "$PUBLISH_DIR" && zip -r -q "$ZIP" . -x "*.DS_Store")
  echo "→ Packed $(du -h "$ZIP" | awk '{print $1}')"
}

zipdeploy() {
  local code
  code="$(
    curl -4 --http1.1 --max-time 180 -sS -o /tmp/plantyhub-zipdeploy.body -w '%{http_code}' \
      -X POST --data-binary @"$ZIP" \
      -H 'Content-Type: application/octet-stream' \
      -u "${AZURE_PUBLISH_USER}:${AZURE_PUBLISH_PASSWORD}" \
      "https://${AZURE_SCM_HOST}/api/zipdeploy?isAsync=true"
  )"
  printf '%s' "$code"
}

wait_deploy() {
  local i json st
  for i in $(seq 1 40); do
    json="$(
      curl -4 --http1.1 --max-time 30 -sS \
        -u "${AZURE_PUBLISH_USER}:${AZURE_PUBLISH_PASSWORD}" \
        "https://${AZURE_SCM_HOST}/api/deployments/latest" || true
    )"
    st=0
    printf '%s' "$json" | python3 -c '
import json, sys
raw = sys.stdin.read().strip()
if not raw:
    raise SystemExit(2)
d = json.loads(raw)
complete = bool(d.get("complete"))
status = int(d.get("status") or 0)
if complete and status == 4:
    raise SystemExit(0)
if complete and status == 3:
    raise SystemExit(1)
raise SystemExit(2)
' || st=$?
    case $st in
      0) echo "→ Deploy finished"; return 0 ;;
      1) echo "Deploy failed on Azure." >&2; return 1 ;;
    esac
    sleep 3
  done
  echo "Timed out waiting for Azure deploy." >&2
  return 1
}

verify() {
  local code
  code="$(curl -4 --http1.1 --max-time 90 -sS -o /tmp/plantyhub-health.body -w '%{http_code}' "$AZURE_SITE_URL/health")"
  echo "→ GET /health → $code $(head -c 80 /tmp/plantyhub-health.body)"
  [[ "$code" == "200" ]]
}

deploy_once() {
  local code
  code="$(zipdeploy)"
  echo "→ ZipDeploy HTTP $code"
  if [[ "$code" == "401" || "$code" == "403" ]]; then
    return 77
  fi
  if [[ "$code" != "200" && "$code" != "202" ]]; then
    echo "ZipDeploy failed:" >&2
    head -c 400 /tmp/plantyhub-zipdeploy.body >&2 || true
    echo >&2
    return 1
  fi
  wait_deploy
  verify
}

ensure_password
build

while true; do
  set +e
  deploy_once
  status=$?
  set -e
  if [[ "$status" -eq 0 ]]; then
    echo
    echo "Live: $AZURE_SITE_URL"
    echo "API:  $AZURE_SITE_URL/api/products"
    exit 0
  fi
  if [[ "$status" -eq 77 ]]; then
    echo "Publish password rejected (HTTP 401/403)."
    ask_password
    load_cred
    continue
  fi
  exit "$status"
done
