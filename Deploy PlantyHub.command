#!/bin/bash
# Double-click in Finder to deploy UI + API to Azure.
ROOT="$(cd "$(dirname "$0")" && pwd)"
"$ROOT/scripts/deploy-azure.sh"
status=$?
echo
if [[ "$status" -eq 0 ]]; then
  echo "Готово."
else
  echo "Деплоят спря с код $status."
fi
read -r -p "Натисни Enter за затваряне... " _
exit "$status"
