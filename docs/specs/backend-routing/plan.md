# Execution Plan — API Alignment v1

> Follow these steps sequentially. Check off each item as you complete it. Keep commits scoped (e.g., backend rename, repo extraction, frontend wiring).

## Phase 1 — Backend Preparation
1. **Freeze main branch** by syncing with latest changes; install deps in `backend/`.
2. **Rename `modelServices/` → `repos/`:**
   - Move the directory and update every import (`routes/*`, `server.ts`, tests).
   - Verify `tsc --noEmit` passes after the rename.
3. **Create shared Supabase/PG helpers** under `backend/src/utils` if one doesn’t already exist (e.g., `supabaseClient.ts`).

## Phase 2 — Repository Standardization
4. For each entity (`posts`, `cars`, `mods`, `updates`, `users`, `likes`, `images`, `follows`, `comments`):
   - Create `backend/src/repos/<entity>Repo.ts`.
   - Move existing logic from the old service into the repo, exporting CRUD methods (`list`, `getById`, `create`, `update`, `remove` as needed).
   - Ensure each method receives the authenticated user ID when authorization is required.
5. Add lightweight unit tests or at least manual invocation scripts for complex repos (optional but recommended).

## Phase 3 — Route Cleanup
6. Audit every router in `backend/src/routes`:
   - Import the new repo module.
   - Call repo methods only; keep routes focused on validation/HTTP details.
   - Confirm all routes (except `/api/users` as noted) remain behind `authenticate`.
7. Run backend type checks and start the server via `npx ts-node src/server.ts`; hit `/ping` to confirm baseline health.

## Phase 4 — Frontend API Clients
8. In `frontend/src`, create `api/` folder with one client per entity (e.g., `api/posts.ts`):
   - Wrap `fetch` requests to `/api/<entity>` endpoints.
   - Inject Supabase JWT from `supabase.auth.getSession()` into the `Authorization` header.
9. Update pages/components (feed, profile, car, mod dialogs, likes/comments) to call these clients instead of Supabase directly.
10. Keep Supabase usage solely for auth/session management until backend provides signup/login endpoints.

## Phase 5 — Verification
11. Backend: `cd backend && npx tsc --noEmit` and run targeted manual tests (curl/Postman) for each route.
12. Frontend: `cd frontend && npm run dev`; verify:
    - Feed loads, posting works.
    - Garage lists cars/mods/images.
    - Likes/comments/follows behave with new API.
    - Error states handled gracefully (expired token, missing data).
13. Document any remaining direct Supabase calls (if unavoidable) as TODOs referencing this spec.

## Phase 6 — Handoff
14. Update `docs/ai/architecture.md` Data Flow section to reflect the new routing pattern once finished.
15. Summarize work + verification steps in the PR/commit description and link back to `docs/specs/backend-routing/spec.md`.
