# Feature Spec Template

> Copy this file, replace placeholders (`<>`), and remove any sections that are not needed. Keep the headings so AI agents can parse the structure.

---

## 1. Feature Overview
- **Name:** `<Short codename>`
- **Type:** `Feature | Enhancement | Bugfix | Cleanup`
- **Summary:** One paragraph describing the change in plain language.
- **Status:** `Draft | In Progress | Ready | Done`
- **Owner:** `<Person/AI>`

## 2. Problem & Goals
- **Problem Statement:** What user pain or tech gap are we solving?
- **Goals:** Bullet list of measurable outcomes.
- **Non-Goals:** Explicitly state what is *out of scope*.

## 3. Context & References
- Link existing specs, ADRs, tickets, or discussions.
- Mention related cars/garage/social features if relevant.
- Note any Supabase tables, RPCs, or policies involved.

## 4. User & Data Flows
- **User stories:** `As a <role>, I want...`
- **UI flow:** Brief description or ASCII diagram referencing React routes/components.
- **Data flow:** How requests move through frontend → backend → Supabase.

## 5. Requirements
### Functional
- Checklist of behaviors (include feed, posts, comments, garage, mods, etc. when applicable).

### Non-Functional
- Performance, security, accessibility, mobile, etc.

## 6. System Changes
### Frontend
- Files/components to touch (`frontend/src/...`), props/state/data considerations, Supabase vs API usage.

### Backend
- Routes/services/middleware updates (`backend/src/...`), data validation, DB queries or schema changes.

### Data & Schema
- New tables/columns or Supabase policy updates. Include migration plan if needed.

## 7. Implementation Plan
- Step-by-step tasks.
- Mention required feature flags, env vars, or config changes.
- Include risk mitigations or fallback plan.

## 8. Testing & Validation
- **Automated:** Unit/integration/e2e targets.
- **Manual:** How to verify in dev (commands, accounts, sample payloads).
- **Edge cases:** Auth failures, empty garages, large image uploads, etc.

## 9. Rollout & Monitoring
- Deployment order (backend vs frontend).
- Metrics/logs to watch (errors, feed performance, Supabase quotas).
- Communication plan (release notes, in-app cues).

## 10. Open Questions
- List unresolved decisions blocking work.

---

## Final Checklist
- [ ] Requirements reviewed with stakeholders.
- [ ] Frontend ↔ backend contracts confirmed.
- [ ] Supabase security implications addressed.
- [ ] Tests and manual validation steps defined.
- [ ] Rollout strategy approved.
