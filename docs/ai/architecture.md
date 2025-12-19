# AI Architecture Brief

## Layered Overview
- **Client UI (`frontend/`)**: React 19 + TypeScript served by Vite. Handles routing, Supabase auth session, and today calls Supabase REST/RPC directly via `src/utils/supabaseClient.ts`.
- **API Server (`backend/`)**: Express 5 + TypeScript. Provides authenticated REST endpoints (`/api/{posts,cars,mods,...}`) backed by Supabase/Postgres through service modules.
- **Data Platform (Supabase)**: Auth, row-level security, Postgres storage, storage buckets for images. Secrets sourced from `.env`/Vite env vars—never commit.

```
[React UI + Supabase client]  --> (future) -->  [Express API + services] --> [Supabase (Postgres, Auth, Storage)]
         ^ current data calls (direct)                                ^ today's data + auth source
```

## Frontend Architecture
- **Entry + routing**: `src/main.tsx` bootstraps `BrowserRouter`; `App.tsx` gates routes based on Supabase session and shows modals (`AddPost`, `AddCar`) and persistent `Navbar`.
- **Pages vs components**: Pages under `src/pages/` fetch data (currently via Supabase client) and assemble domain-specific components from `src/components/`. Lightweight utilities live in `src/utils/`.
- **State + auth**: Supabase session stored in `App.tsx`; `supabase.auth.onAuthStateChange` keeps it in sync. There is no global state manager yet; keep state local or use context when necessary.
- **Styling**: `App.css` + `index.css` placeholders; Tailwind config exists but is not enforced. Favor utility-friendly classNames that can later map to Tailwind.
- **Build/hosting**: Vite dev server locally (`npm run dev`). `vercel.json` indicates deployment via Vercel; ensure assets/endpoints remain edge-friendly (no Node-only APIs in frontend bundle).

### Frontend Evolution Targets
1. Replace direct Supabase reads/writes with calls to backend endpoints (`/api/*`).
2. Encapsulate remaining Supabase calls in a single gateway (e.g., `src/api/client.ts`) for easier migration.
3. Introduce shared types that mirror backend DTOs to keep contracts aligned.

## Backend Architecture
- **Server entry**: `src/server.ts` loads env, creates Express app, registers JSON middleware, mounts routes, and applies `authenticate` middleware across most paths.
- **Routing**: Each domain (`posts`, `cars`, `mods`, `updates`, `users`, `likes`, `images`, `follows`, `comments`) has a dedicated router under `src/routes/`. Routes are thin: they validate params, call a matching service, and return JSON.
- **Service layer**: `src/modelServices/` modules encapsulate Supabase/Postgres access (via `pg`, `@supabase/supabase-js`, or REST). Keep SQL or RPC logic here; never in routes.
- **Middleware**: `src/middleware/authMiddleware.ts` validates Supabase JWTs (using `SUPABASE_JWT_SECRET`) and attaches `userID` to the request. Add new cross-cutting concerns (rate limiting, logging) as middleware.
- **Utilities**: `src/utils/` holds shared helpers (e.g., Supabase client factory, error mappers). Always check for an existing helper before creating a new one.
- **Database schema**: Managed via `backend/database/schema.sql`. Apply changes with `npm run db:create`, which pipes the SQL to Supabase using `psql`.

### Backend Evolution Targets
1. Provide parity endpoints for every client-side Supabase call before migrating UI.
2. Centralize environment access (e.g., single module exporting Supabase client + config) to avoid scattered `dotenv` usage.
3. Add automated tests (unit for services, integration for routes) once routing stabilizes.

## Data & Auth Flow
1. **Auth**: Frontend authenticates with Supabase (email magic links/OTP). Supabase returns JWT (Anon/Service). Token is stored client-side.
2. **Current data path**: React components call Supabase directly using the session's access token. This bypasses Express, so RBAC is enforced via Supabase policies.
3. **Target data path**: React components call `fetch('/api/...')` -> Express verifies Supabase JWT via `authenticate` -> services perform DB ops via service account (using `pg` or Supabase service key) -> result returned to client. This allows more custom business logic and shields Supabase keys.

## Integration Contracts
- **HTTP**: Express routes follow REST-ish conventions (`GET /api/posts`, `POST /api/cars`). When adding new endpoints, update both router + service and document payload shapes.
- **Types**: Mirror shared entities (User, Post, Car, etc.) across frontend/back using TypeScript interfaces. Consider generating types from a shared schema (future).
- **Events/Modals**: Frontend triggers modal open events via `window.dispatchEvent(new Event('openAddPostModal'))`. Preserve this pattern or migrate to context-based triggers consistently.

## Observability & Ops (Current State)
- Logging is console-based in both tiers. There is no centralized monitoring.
- Errors surface to clients directly with generic JSON payloads. When extending APIs, keep PII out of logs/responses.
- Deployment scripts are manual; align `npm run build` outputs with hosting targets (Vercel for frontend, TBD for backend).

## Constraints & Guardrails
- Only `npm` for dependencies; lockfiles exist at repo root and per package.
- Keep secrets outside the repo. Use `.env` + Vite env files with `VITE_` prefix for frontend exposure.
- Favor incremental adoption: wrap Supabase interactions, then swap implementations, rather than rewriting entire flows.
- Every architecture-altering change should add/append an ADR in `docs/ai/decisions/`.
