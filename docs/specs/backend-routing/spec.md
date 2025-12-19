# Backend API Alignment Spec

## 1. Feature Overview
- **Name:** API Alignment v1
- **Type:** Feature
- **Summary:** Route all frontend data access through the Express backend by introducing per-table repositories, renaming `modelServices/` to `repos/`, and ensuring each Supabase table has matching repo + route files.
- **Status:** Draft
- **Owner:** Codex AI

## 2. Problem & Goals
- **Problem Statement:** React components call Supabase directly, duplicating business logic, exposing keys, and bypassing Express auth middleware.
- **Goals:**
  - Move all DB calls into backend repositories.
  - Ensure every Supabase table has a dedicated repo and router pair.
  - Wire frontend data flows to backend endpoints instead of Supabase SDK.
- **Non-Goals:** Creating new product features, changing Supabase schema, or reworking auth UX.

## 3. Context & References
- Existing backend folders: `backend/src/modelServices/`, `backend/src/routes/`.
- Current frontend callers: `frontend/src/pages/*`, `frontend/src/components/*` using `supabase` helper.
- Docs: `docs/ai/system.md`, `docs/ai/architecture.md`.

## 4. User & Data Flows
- **User stories:**
  - As a logged-in user, I want the feed to load via `/api/posts` without exposing Supabase keys.
  - As a garage owner, I want CRUD on cars/mods/images routed through Express so server rules apply consistently.
- **UI flow:** React page → `api/<entity>Client` wrapper → `fetch /api/<entity>` → Express router → repo → Supabase/Postgres.
- **Data flow:** Browser -> Backend (JWT validated) -> Repo uses service key/pg to query Supabase -> Response returned.

## 5. Requirements
### Functional
- Rename `backend/src/modelServices` to `backend/src/repos` (update imports).
- Each DB table (`posts`, `cars`, `mods`, `updates`, `users`, `likes`, `images`, `follows`, `comments`) owns:
  - `backend/src/repos/<table>Repo.ts` exporting CRUD helpers.
  - `backend/src/routes/<table>Routes.ts` using repo functions.
- Frontend modules stop importing `supabase` directly; instead call a typed API client per entity.
- Supabase service key usage restricted to backend repos.

### Non-Functional
- Maintain parity with existing functionality (no regressions).
- Preserve auth requirements (routes requiring `authenticate` remain protected).
- Ensure TypeScript builds pass in both packages.

## 6. System Changes
### Frontend
- Introduce `frontend/src/api/<entity>Client.ts` modules to wrap `fetch`.
- Update pages/components to use new clients (feed, profile, car view, mod flows, likes, comments).
- Keep Supabase usage temporarily for auth-only (session, login/signup) until backend handles auth flows.

### Backend
- Rename `modelServices` folder and update `import` paths (routes, server entry).
- Normalize repo interface (e.g., `list`, `getById`, `create`, `update`, `remove`).
- Ensure each router maps HTTP verbs to repo functions and handles validation/errors consistently.
- Add unit smoke tests (optional) or manual verification script for each route.

### Data & Schema
- No schema changes expected; ensure repos reference existing tables/columns and respect Supabase policies.

## 7. Implementation Plan
1. Rename directory `modelServices/` → `repos/` and update import paths in routes/server/tests.
2. For each entity, extract Supabase interactions into `repos/<entity>Repo.ts`; enforce single Supabase client factory in `backend/src/utils`.
3. Audit every route file to ensure it calls the repo exclusively; align naming conventions (`router.get('/', ...)` etc.).
4. Create frontend API clients (`src/api/posts.ts`, etc.) that hit Express endpoints with JWT from Supabase session.
5. Incrementally update pages/components to use API clients; remove direct Supabase reads/writes except for auth.
6. Regression test:
   - Backend: run `npx tsc --noEmit`, manual calls via Postman/curl.
   - Frontend: run `npm run dev`, exercise feed, garage, posting, liking, commenting.
7. Clean up unused Supabase helpers and document new flow in `/docs/ai/architecture.md` (update Data Flow section once implemented).

## 8. Testing & Validation
- **Automated:** Type checks for both packages; add lightweight unit tests per repo if possible.
- **Manual:** 
  - Login/signup via Supabase to obtain JWT.
  - Hit `/api/*` endpoints to confirm data returns.
  - In UI, verify feed rendering, posting, garage CRUD, likes/comments, mod uploads.
- **Edge cases:** Expired JWT, unauthorized access to another user’s garage, empty feeds/garages, large image payloads.

## 9. Rollout & Monitoring
- Rollout order: backend changes first (deploy), then frontend switch to API clients.
- Monitor backend logs for auth failures and Supabase quota usage.
- Confirm no CORS issues when frontend hits backend.

## 10. Open Questions
- Should repos use Supabase REST, PostgREST, or direct `pg` client for consistency?
- Do we expose file uploads via backend or keep them client→Supabase storage for now?
- Is there a shared DTO/types package needed to avoid duplication?

---

## Final Checklist
- [ ] Requirements reviewed with stakeholders.
- [ ] Frontend ↔ backend contracts confirmed.
- [ ] Supabase security implications addressed.
- [ ] Tests and manual validation steps defined.
- [ ] Rollout strategy approved.
