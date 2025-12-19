# AI System Guide

## Mission
- Act as the repo-native AI pair, designing, building, and verifying features without drifting from the established stack.
- Keep the frontend (React + TS + Vite) and backend (Express + TS + Node) in sync; prefer wiring UI → API instead of calling Supabase directly.
- Document intent and behavior as you go so humans can follow along later.

## Repo Map
| Path | Purpose | Notes |
| --- | --- | --- |
| `frontend/` | React + TypeScript app via Vite. | Uses `npm`; check `src/` for routes/components, Tailwind setup pending. |
| `backend/` | Express + TypeScript API. | Organized by `routes/`, `modelServices/`, `middleware/`, `utils/`; `server.ts` is the entrypoint. |
| `backend/database/schema.sql` | Supabase schema references. | Managed via `npm run db:create` (psql command). |
| `docs/specs/` | Human feature specs (existing). | Align any AI work to these specs when present. |
| `docs/ai/` | This AI system. | Follow this guide plus the files referenced in `/docs/ai/index.md`. |

## Core Technologies
- **Runtime:** Node 20+ assumed (align with local `nvm` if present).
- **Package manager:** `npm` everywhere; no `yarn`/`pnpm`.
- **Frontend:** React 19, React Router 7, Vite build pipeline, Tailwind planned but not finalized.
- **Backend:** Express 5, TypeScript, Supabase via `@supabase/supabase-js`, `pg`.
- **Auth & data:** Supabase handles auth + Postgres. Frontend currently hits Supabase directly; future work should migrate to backend endpoints.

## AI Workflow
1. **Read context first:** Inspect specs (`docs/specs/*.md`), relevant app files, and any linked ADRs before editing.
2. **Plan before coding:** Outline steps (Codex plan tool when work is non-trivial). Keep plans updated as tasks progress.
3. **Make surgical changes:** Prefer minimal diffs, reuse helpers/patterns from existing modules, and respect file-level conventions.
4. **Test locally:** Use targeted commands (`npm run dev`, `npm run build`, backend unit/integration scripts) or add temporary scripts when missing. Document any gaps.
5. **Document & handoff:** Update specs/ADR/readmes if behavior changes; summarize changes + verification steps in responses.

## Frontend Guidance
- Entry file `frontend/src/main.tsx`; routing under `frontend/src/routes` (confirm before edits).
- Components should call backend APIs (future state). For now, if a component touches Supabase directly, wrap it in a helper and mark TODO linking the API route work.
- Styling: no global framework chosen—prefer utility CSS or Tailwind-compatible patterns without committing to a framework until decided.
- Commands:
  ```bash
  cd frontend && npm install
  npm run dev     # local dev server
  npm run build   # production build (checks TS)
  npm run lint    # React + TS lint via ESLint 9
  ```

## Backend Guidance
- `backend/src/server.ts` wires Express app; routes mounted from `backend/src/routes`.
- Services live in `modelServices/`; keep DB access isolated there.
- Middleware for auth/logging in `backend/src/middleware`.
- Environment: `.env` for Supabase/PG secrets (never commit). Use `dotenv` in entrypoint.
- Commands:
  ```bash
  cd backend && npm install
  npx tsc --noEmit        # type check
  npx ts-node src/server.ts  # run dev server
  npm run db:create       # apply schema to Supabase (psql)
  ```

## Supabase Rules
- Only backend talks to Supabase in new work; frontend must go through Express routes.
- When adding queries:
  - Centralize SQL in services/utilities.
  - Reuse Supabase client helpers if they exist; otherwise encapsulate creation in one module.
  - Document schema expectations inline or reference `backend/database/schema.sql`.

## Documentation Flow
- `/docs/ai/index.md` (next file) will map the rest of the AI docs.
- Use `/docs/ai/spec-template.md` (later) when drafting new feature specs for AI execution.
- Record significant architectural choices in `/docs/ai/decisions/ADR-XXXX.md`.

## Quality Checklist
- ✅ All code formatted/linted via project tools.
- ✅ Tests or manual verification steps captured in the response.
- ✅ No direct DB calls from UI in new code.
- ✅ No secrets or Supabase creds leaked.
- ✅ Responses reference touched files with line numbers per repo guidance.
