# PlantyHub API

ASP.NET Core 8 backend for the PlantyHub store.

## Run

```bash
cd PlantyHub.Api
dotnet run
```

API: `http://localhost:5281` · Health: `GET /health`

Development uses SQLite (`plantyhub.dev.db`). Production uses PostgreSQL — set `Database:UseSqlite` to `false` in `appsettings.json`.

## Admin login

| Email | Password |
|-------|----------|
| `admin@plantyhub.com` | `admin123` |

Send JWT as `Authorization: Bearer <token>`.

## Cloudflare R2 (image uploads)

Admin image uploads go to a public R2 bucket via `POST /api/admin/media/upload`.

### Setup

1. Create an R2 bucket in the Cloudflare dashboard (e.g. `plantyhub`).
2. Enable **public access** (custom domain or R2.dev subdomain) and copy the public base URL.
3. Create an R2 API token with Object Read & Write on that bucket.
4. Set config in `appsettings.Development.json` or environment variables:

```json
"R2": {
  "AccountId": "<cloudflare-account-id>",
  "AccessKeyId": "<r2-access-key-id>",
  "SecretAccessKey": "<r2-secret-access-key>",
  "BucketName": "plantyhub",
  "PublicBaseUrl": "https://media.yourdomain.com"
}
```

Env equivalents: `R2__AccountId`, `R2__AccessKeyId`, `R2__SecretAccessKey`, `R2__BucketName`, `R2__PublicBaseUrl`.

Without R2 configured, the upload endpoint returns `503` — you can still paste any image URL in admin fields.

### Media API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/media/upload` | Multipart file upload (JPEG/PNG/WebP/GIF, max 8 MB) → `{ url, key }` |
| GET | `/api/site-assets` | Public site image overrides (blog, about, PDP extras) |
| PUT | `/api/site-assets` | Admin update of site image map |

---

## Email (SMTP + templates)

Transactional and campaign emails use DB templates with `{{variable}}` placeholders. If `Email:SmtpHost` is empty, messages are logged to the console (`DevEmailSender`) instead of being sent.

### SMTP config

```json
"Email": {
  "FromAddress": "noreply@plantyhub.com",
  "FromName": "PlantyHub",
  "SmtpHost": "smtp.example.com",
  "SmtpPort": 587,
  "SmtpUser": "user",
  "SmtpPassword": "secret",
  "UseSsl": true
}
```

Env equivalents: `Email__FromAddress`, `Email__FromName`, `Email__SmtpHost`, `Email__SmtpPort`, `Email__SmtpUser`, `Email__SmtpPassword`, `Email__UseSsl`.

Seeded template keys: `verify-email`, `password-reset`, `welcome`, `order-confirmation`, `order-shipped`, `order-cancelled`, `newsletter`.

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
