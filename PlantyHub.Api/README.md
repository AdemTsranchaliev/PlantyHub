# PlantyHub API

ASP.NET Core 8 backend for the PlantyHub store.

## Run

```bash
cd PlantyHub.Api
dotnet run
```

API: `http://localhost:5281` · Health: `GET /health`

The API uses Azure SQL (`plantyhub.database.windows.net` / `plantyhub_shop`). The SQL password lives in user-secrets on this machine, not in git. Allow your IP on the SQL firewall. A paused free/serverless database may take ~30s to wake. App Service gets the full connection string from Application Settings (`ConnectionStrings__DefaultConnection`).

## Admin login

| Email | Password |
|-------|----------|
| `admin@plantyhub.com` | `admin123` |

Send JWT as `Authorization: Bearer <token>`.

## Cloudflare R2 (image uploads)

Admin image uploads go to a public R2 bucket via `POST /api/admin/media/upload`. The site stores the original object URL and requests resized/WebP variants through Cloudflare Image Transformations (`/cdn-cgi/image/…`).

### Setup

1. In Cloudflare → **R2 Object Storage**, create a bucket named `plantyhub`.
2. Open the bucket → **Settings** → **Public access** → **Custom Domains** → **Connect Domain** → `media.plantyhub.com`. Cloudflare adds the DNS CNAME. Do not use the `r2.dev` URL in production (no cache, no image transforms).
3. **Images → Transformations** → enable transformations on the `plantyhub.com` zone. Allowed sources: same zone (covers `media.plantyhub.com`).
4. **R2 → Manage R2 API Tokens** → create a token with **Object Read & Write** on bucket `plantyhub`. Copy Access Key ID, Secret Access Key, and Account ID (Overview page).
5. Put secrets in user-secrets (do not commit them):

```bash
cd PlantyHub.Api
dotnet user-secrets set "R2:AccountId" "<cloudflare-account-id>"
dotnet user-secrets set "R2:AccessKeyId" "<r2-access-key-id>"
dotnet user-secrets set "R2:SecretAccessKey" "<r2-secret-access-key>"
dotnet user-secrets set "R2:BucketName" "plantyhub"
dotnet user-secrets set "R2:PublicBaseUrl" "https://media.plantyhub.com"
```

Env equivalents: `R2__AccountId`, `R2__AccessKeyId`, `R2__SecretAccessKey`, `R2__BucketName`, `R2__PublicBaseUrl`.

Public files are then `https://media.plantyhub.com/uploads/…`. The frontend rewrites those to `https://media.plantyhub.com/cdn-cgi/image/width=720,format=auto,…/uploads/…`.

Without R2 configured, the upload endpoint returns `503` — you can still paste any image URL in admin fields.

### Media API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/media/upload` | Multipart file upload (JPEG/PNG/WebP/GIF, max 80 MB) → `{ url, key }` |
| GET | `/api/site-assets` | Public site image overrides (blog, about, PDP extras) |
| PUT | `/api/site-assets` | Admin update of site image map |

---

## Email (Azure Communication Services + templates)

Transactional and campaign emails use DB templates with `{{variable}}` placeholders. If `Email:ConnectionString` is set, mail goes through Azure Communication Services Email. Otherwise, if `Email:SmtpHost` is set, SMTP is used. If neither is set, messages are logged to the console (`DevEmailSender`) and are not delivered.

The sender must be a verified MailFrom address on that ACS resource (`Email:FromAddress`, default `DoNotReply@plantyhub.com`).

```bash
cd PlantyHub.Api
dotnet user-secrets set "Email:ConnectionString" "endpoint=https://<resource>.communication.azure.com/;accesskey=<key>"
```

Env equivalent: `Email__ConnectionString`. The deploy script copies this secret into production.

### SMTP config

```json
"Email": {
  "FromAddress": "DoNotReply@plantyhub.com",
  "FromName": "PlantyHub",
  "SmtpHost": "smtp.example.com",
  "SmtpPort": 587,
  "SmtpUser": "user",
  "SmtpPassword": "secret",
  "UseSsl": true
}
```

Env equivalents: `Email__FromAddress`, `Email__FromName`, `Email__SmtpHost`, `Email__SmtpPort`, `Email__SmtpUser`, `Email__SmtpPassword`, `Email__UseSsl`.

Seeded template keys: `verify-email`, `password-reset`, `welcome`, `order-confirmation`, `order-invoice`, `order-admin`, `order-shipped`, `order-cancelled`, `newsletter`.

### Email templates (admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/email-templates` | List templates |
| GET | `/api/admin/email-templates/{key}` | Get template (incl. sample data) |
| PUT | `/api/admin/email-templates/{key}` | Update name/subject/html/sample data |
| POST | `/api/admin/email-templates/{key}/preview` | Render `{ subject, html }` with optional variables |
| POST | `/api/admin/email-templates/{key}/send-test` | `{ "email": "...", "variables": { } }` |

### Newsletter campaign

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/newsletter/send` | Send `newsletter` template to all active subscribers; optional `{ subject, headline, htmlBody, ctaUrl }` overrides |

---

## Products (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Active products by category |
| GET | `/api/products/category/{category}` | Active products in one category |
| GET | `/api/products/{slug}` | Single product |

Categories: `gardens`, `pods`, `consumables`, `accessories`

## Products (admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/products` | All products (incl. inactive) |
| GET | `/api/admin/products/category/{category}` | Products in category |
| GET | `/api/admin/products/{slug}` | Single product |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/{slug}` | Update product (full replace) |
| PATCH | `/api/admin/products/{slug}/active` | Toggle active `{ "active": true }` |
| DELETE | `/api/admin/products/{slug}` | Delete product |

### Create / update body (frontend-compatible)

```json
{
  "id": "basil",
  "category": "pods",
  "price": "€9.99",
  "compareAt": "€12.99",
  "packKey": "pack3",
  "image": "/images/stock/basil.jpg",
  "imageFit": "contain",
  "featured": false,
  "active": true,
  "colors": [{ "id": "white", "hex": "#FFFFFF" }],
  "locales": {
    "en": { "name": "Basil Seed Pods", "tagline": null, "description": "..." },
    "bg": { "name": "Босилек капсули", "tagline": null, "description": "..." }
  }
}
```

---

## Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | — | Checkout (uses DB prices) |
| GET | `/api/orders/{id}` | optional | Order detail (guest OK) |
| GET | `/api/orders/my` | JWT | Customer orders |
| GET | `/api/admin/orders` | Admin | All orders |
| GET | `/api/admin/orders/{id}` | Admin | Order detail |
| PATCH | `/api/admin/orders/{id}/status` | Admin | `{ "status": "processing" }` |
| POST | `/api/admin/orders/{id}/cancel` | Admin | Cancel order |
| POST | `/api/admin/orders/{id}/waybill` | Admin | Create waybill |
| DELETE | `/api/admin/orders/{id}` | Admin | Delete order |

Statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

---

## Customers (admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/customers` | Customer list |
| GET | `/api/admin/customers/{id}` | Customer + order history |

## Dashboard (admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats, weekly sales, top products |

## Newsletter

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/newsletter/subscribe` | — | Subscribe `{ "email": "..." }` |
| GET | `/api/admin/newsletter/stats` | Admin | Subscriber count |
| GET | `/api/admin/newsletter/subscribers` | Admin | List subscribers |
| DELETE | `/api/admin/newsletter/subscribers/{email}` | Admin | Remove subscriber |
| POST | `/api/admin/newsletter/subscribers/{email}/unsubscribe` | Admin | Deactivate |
| POST | `/api/admin/newsletter/send` | Admin | Campaign send (see Email section) |

## Homepage (admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/homepage` | Get homepage settings |
| PUT | `/api/homepage` | Update sections/texts/images |
| POST | `/api/homepage/reset` | Reset to defaults |

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Customer register |
| POST | `/api/auth/login` | Customer login |
| POST | `/api/auth/admin/login` | Admin login |
| GET | `/api/auth/me` | Current user (JWT) |

---

## Migrations

```bash
dotnet ef migrations add MigrationName
dotnet ef database update
```
