# PlantyHub API

ASP.NET Core 8 backend for the PlantyHub store.

## Run

```bash
cd PlantyHub.Api
dotnet run
```

API: `http://localhost:5280` · Health: `GET /health`

Development uses SQLite (`plantyhub.dev.db`). Production uses PostgreSQL — set `Database:UseSqlite` to `false` in `appsettings.json`.

## Admin login

| Email | Password |
|-------|----------|
| `admin@plantyhub.com` | `Admin123!` |

Send JWT as `Authorization: Bearer <token>`.

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
