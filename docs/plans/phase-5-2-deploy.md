# Phase 5.2 — Deploy (Vercel + Supabase prod settings + external sync cron)

## Context

Phase 5.1 (UX polish) is done and the live Supabase project is **fully applied
(migrations through `0008`) and synced** (48 teams / 104 matches, admin granted).
The app is functionally whole and only needs to be **put on the internet**:

- No hosting yet — no Vercel project, no `vercel.json`, no CI (`.github/workflows`).
- The protected sync endpoint `POST /api/sync` exists and works from the admin
  **Sync** tab, but nothing calls it on a schedule in production (`BUILD-PLAN`
  §2.6 Step 5 + §5.2).
- Several Phase 2 owner-apply items are stale `◐` in `BUILD-PLAN` even though the
  DB is live — flip them to `☑` here.

**Locked decisions (owner answers):** Deploy-only scope (QA 5.3 is separate);
new Vercel project on the **free Hobby** plan with the default **`*.vercel.app`**
URL (no custom domain); production sync via an **external cron** hitting
`POST /api/sync` (works on Hobby; Vercel Cron's once/day Hobby limit is too coarse
for the ~50-min cadence).

**Single Supabase project** is reused for production — "Supabase prod settings"
means adding the production URL to the existing project's auth allow-list, not a
new database.

## Scope

**In:** Vercel project + env vars, Supabase auth URL config for the prod domain,
a committed external-cron scheduler (GitHub Actions) pointing at `/api/sync`,
production smoke test, and the docs update.

**Out (explicit):** 5.3 QA dry-run (separate plan), custom domain, Vercel Pro /
Vercel Cron, any schema/RLS/feature/scoring changes, multi-environment (no
separate staging DB).

---

## Implementation

### Step 1 — Pre-flight (local, my side)

1. `npm run build` (Turbopack) + `npm run lint` — confirm a clean production build
   before wiring hosting. (Expected clean from 5.1.)
2. Confirm `.env.example` lists every var the app reads in production:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, optional `WORLDCUP_FEED_URL`.
   (Already present — verify only.)

### Step 2 — Committed external-cron scheduler (my side)

Add `.github/workflows/sync.yml`: a scheduled GitHub Actions workflow that POSTs
to the production `/api/sync` every ~50 min with the Bearer secret, plus a
`workflow_dispatch` for manual runs.

- Schedule: `cron: "*/50 * * * *"` (≈29 runs/day, under the server-side 30/day cap).
- Body: `curl -fsS -X POST "$SYNC_URL" -H "Authorization: Bearer $CRON_SECRET"`.
- Reads repo **Actions secrets** `SYNC_URL` (= `https://<app>.vercel.app/api/sync`)
  and `CRON_SECRET` (= same value set in Vercel).
- Documented caveat in the workflow: GitHub's scheduled runs can be delayed under
  load and are auto-disabled after 60 days of repo inactivity. **Alternative kept
  in the runbook:** a [cron-job.org](https://cron-job.org) job (more punctual, no
  repo change) — owner picks one; the workflow is the version-controlled default.

> Note: this is the only code/repo artifact in 5.2. Everything else is dashboard ops.

### Step 3 — Vercel project (owner runbook, I provide exact steps)

1. Vercel → **Add New → Project** → import the `world-cup-prediction` repo.
   Framework auto-detected as Next.js; no build-setting overrides needed
   (no `vercel.json`).
2. **Environment Variables** (Production scope): set the five from Step 1 with the
   live Supabase values + a strong `CRON_SECRET`. Do **not** prefix the service
   role or `CRON_SECRET` with `NEXT_PUBLIC_`.
3. Deploy. Note the assigned `https://<app>.vercel.app` URL (needed by Steps 4–5).

### Step 4 — Supabase production auth settings (owner runbook)

In the existing Supabase project → **Auth → URL Configuration**:

1. **Site URL** → `https://<app>.vercel.app`.
2. **Redirect URLs** → add `https://<app>.vercel.app/**` (covers `/ar` + `/en`).
3. Re-confirm **Auth → Providers → Email** is enabled and the **Magic Link**
   template shows the six-digit `{{ .Token }}` (already set for dev on this same
   project — verify it survived).

### Step 5 — Wire the scheduler (owner runbook)

1. In the GitHub repo → **Settings → Secrets and variables → Actions**: add
   `SYNC_URL = https://<app>.vercel.app/api/sync` and `CRON_SECRET` (matching
   Vercel exactly).
2. Trigger the workflow once via **Actions → Sync → Run workflow** and confirm a
   `200` and a new row in the admin Sync last-run log.

### Step 6 — Production smoke test (5.2 Step 3)

On `https://<app>.vercel.app` in `ar` (RTL) and `en`, at mobile (~375px) + desktop:

1. Home redirects to `/ar`; login with a real email → typed OTP code → session.
2. Profile setup/edit works; **saved** toast shows.
3. Fixtures render (synced data), kickoff in local time; make a prediction on an
   upcoming match → autosave inline status; a past match is results-only.
4. Privacy: a second account cannot see the first's pre-kickoff pick.
5. Leaderboard renders with synced/scored data; row → member breakdown.
6. Admin (`ahmed.mohamed.xx420@gmail.com`): Sync tab **Sync results** returns a
   count toast and logs a run; the scheduled Action also lands a run.

### Step 7 — Docs update (do this at the end)

1. `docs/BUILD-PLAN.md`: flip **5.2 Steps 1–3 → ☑**; flip the now-true stale
   Phase 2 owner items — `2.1` Step 4, `2.2` Step 4, `2.5` owner line, `2.6`
   Steps 4 **and** 5 — to `☑`; move **Current Position** to "Phase 5.2 done →
   next: 5.3 QA dry-run"; bump "Last updated" / rev.
2. `docs/PROJECT-CONTEXT.md`: §10 — change "Automated result scheduler: not built"
   to **built (external GitHub Actions cron → `POST /api/sync`, ~50-min cadence,
   under the 30/day cap)**; update the status line / rev.
3. `docs/CHANGELOG.md`: prepend a dated entry (plan item 5.2; what changed, why
   external cron over Vercel Cron on Hobby; files touched; gotchas — single shared
   Supabase project, redirect-URL wildcard, GH-Actions schedule drift).

---

## Files to modify

- **New:** `.github/workflows/sync.yml` (scheduled + manual `/api/sync` caller).
- **Docs:** `docs/BUILD-PLAN.md`, `docs/PROJECT-CONTEXT.md`, `docs/CHANGELOG.md`.
- **Verify only (no edit expected):** `.env.example`, `README.md` (sync section
  already documents the external-scheduler option).

## Owner-only actions (cannot be automated from here)

Vercel project creation + env vars (Step 3); Supabase auth URL config (Step 4);
GitHub Actions secrets + first run (Step 5); the production smoke test (Step 6).
I provide exact click-by-click steps and verify the repo artifact + build.

## Verification

1. `npm run build` + `npm run lint` clean (Step 1).
2. The `*.vercel.app` deployment is reachable and redirects `/` → `/ar`.
3. OTP login round-trips on production; privacy holds across two accounts.
4. The scheduled Action returns `200` and writes a `sync_runs` row; manual admin
   sync still works.
5. RTL/LTR + mobile/desktop smoke pass in both locales.
6. No regressions: scoring/leaderboard/autosave unchanged.

## Open risk notes

- **GitHub Actions schedule drift** under load; cron-job.org is the punctual
  fallback (documented, owner's choice).
- **Hobby function limits**: results sync is 1 fetch — fine; a full re-sync (104
  upserts) is a rare manual action, run from the admin tab if ever needed.
- **Secret parity**: `CRON_SECRET` must be identical in Vercel and the GH secret,
  or `/api/sync` returns 401.
