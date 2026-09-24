# PlantyHub

Monorepo for the PlantyHub smart hydroponic garden store.

## Projects

| Folder | Description |
|--------|-------------|
| [`plantyhub.ui/`](plantyhub.ui/) | React + TypeScript + Vite frontend |
| [`PlantyHub.Api/`](PlantyHub.Api/) | ASP.NET Core 8 REST API |

## Quick start

### Frontend

```bash
cd plantyhub.ui
npm install
npm run dev
```

### Backend

```bash
cd PlantyHub.Api
dotnet run
```

API: `http://localhost:5281` · UI dev server: `http://localhost:5173`

The API uses Azure SQL (`plantyhub.database.windows.net`). Connection password is in user-secrets. Allow your IP on the SQL firewall, then `dotnet run` seeds the catalog.

See each project's README for details.
