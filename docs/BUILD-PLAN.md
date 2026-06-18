# Build Plan — FIFA World Cup Prediction

> **The ordered backlog and exactly where we are.** Build top-to-bottom; each item
> is small enough to finish, verify, and commit on its own. **After every coding
> execution, update the status markers below and the "Current Position" pointer,
> then append a matching entry to `[CHANGELOG.md](./CHANGELOG.md)`.**
>
> **Last updated:** 2026-06-18 (rev 20)

---

## Status legend

- ☐ **To do**
- ◐ **In progress**
- ☑ **Done** (built + verified)
- ⊘ **Blocked / skipped** (note why inline)

## Current Position

➡️ **Phase 5.2 repo-side deploy prep remains owner-bound; phone sign-in now uses a country selector with locked dial key and one-line number boxes; then 5.3 QA dry-run.**
Local pre-flight is clean (`npm run build` + `npm run lint`), `.env.example`
still covers every production env var, and the match-aware GitHub Actions
scheduler is committed. The remaining 5.2 work is dashboard-bound: create the Vercel
project, add the production URL to Supabase Auth settings, set GitHub Actions
secrets, trigger the workflow once, and run the production smoke test.

Out-of-band fix (rev 14): login showed a false error after a correct OTP code
because the post-verify profile lookup selected from `profiles` unfiltered — and
the leaderboard RLS (`using (true)`) makes every profile readable, so
`.maybeSingle()` errored once more than one member existed. Now scoped to the
signed-in user's id. See CHANGELOG 2026-06-17.

Out-of-band UX pass (rev 15): clearer `BackLink` (outlined + arrow), animated
autosave status pill, login now hard-navigates after OTP verify so the app loads
without a manual refresh, in-progress (kicked-off but unscored) matches stay in
**Upcoming** with a "live" badge instead of falling into Finished, and Upcoming
shows only the next 24h batch of fixtures. See CHANGELOG 2026-06-17 and
PROJECT-CONTEXT §4.10.

Owner enhancement (rev 16): added a switchable auth mode. Default is a
passwordless **phone-number** sign-in for the friend group (no SMS / no
verification — typing the number is the whole login); set
`NEXT_PUBLIC_AUTH_MODE=otp` to fall back to the original email-OTP flow, which
is kept intact for reuse. Phone numbers map to synthetic Supabase accounts so
RLS still works. See CHANGELOG 2026-06-17 and PROJECT-CONTEXT §4.11.

Owner enhancement (rev 17): upgraded phone mode from one plain tel input to a
segmented country-code + national-number input. It pre-fills +966, focuses the
first national-number digit, auto-advances across boxes, supports backspace,
arrow keys, and paste distribution, and animates a localized flag/name when a
known dialing code is entered. The backend action still receives one hidden
`phone` field. See CHANGELOG 2026-06-17.

Owner refinement (rev 18): narrowed the segmented phone input to exactly a
country key plus 9 national-number digits. The national-number area is now three
groups of three boxes, and Continue is disabled until all 9 are filled. See
CHANGELOG 2026-06-17.

Owner refinement (rev 19): replaced editable country-key boxes with a searchable
country picker. Sudan and Saudi Arabia are pinned first, followed by Gulf and
Middle East countries; selecting a country locks/autopopulates the dial key and
renders the appropriate count of national-number boxes. See CHANGELOG 2026-06-18.

Owner refinement (rev 20): national-number boxes now stay in one straight,
responsive row beside the locked dial key on both phone and desktop widths. See
CHANGELOG 2026-06-18.

---

## Phase 0 — Foundation

> Goal: a running, localized, Supabase-connected Next.js shell with nothing
> business-specific yet.

### 0.1 Project docs ☑

- ☑ Step 1 — `PROJECT-CONTEXT.md` (objective, decisions, data model, scoring, RLS)
- ☑ Step 2 — `BUILD-PLAN.md` (this file)
- ☑ Step 3 — `CHANGELOG.md` seeded
- ☑ Step 4 — `CLAUDE.md` wiring the docs into the workflow
- ☑ Step 5 — Owner sign-off on docs before scaffolding (granted 2026-06-12)

### 0.2 Next.js + TypeScript + Tailwind + shadcn ☑

- ☑ Step 1 — `create-next-app` (App Router, TS, ESLint, Tailwind) — Next 16, React 19, Tailwind v4
- ☑ Step 2 — Init shadcn/ui (RTL on); added base components (button, input, card)
- ☑ Step 3 — Global theme tokens / colors for the "sports app" look (green primary)
- ☑ Step 4 — Arabic-friendly font (**Tajawal**) wired into the root layout as `--font-sans`
- ☑ Step 5 — Verified `npm run build` + `npm run lint`; committed

### 0.3 i18n + RTL (next-intl) ☑

- ☑ Step 1 — next-intl v4 configured (`[locale]` routing, `src/proxy.ts`); locales `ar` (default) + `en`
- ☑ Step 2 — `messages/ar.json`, `messages/en.json` scaffolds (`common`/`nav`/`language`)
- ☑ Step 3 — Locale-aware `[locale]/layout.tsx`: `dir="rtl"` for `ar`, `ltr` for `en` (verified via curl)
- ☑ Step 4 — Sample page uses logical Tailwind props (`ps-`/`border-s`/`text-start`); grep guard clean
- ☑ Step 5 — Language switcher (ar ⇄ en); `/` → 307 → `/ar`, mirroring verified

### 0.4 Supabase wiring ☑

- ☑ Step 1 — Supabase project created by owner; URL + anon/service keys in `.env.local` (git-ignored)
- ☑ Step 2 — `@supabase/supabase-js` + `@supabase/ssr`; browser / server / admin clients (`src/lib/supabase/`)
- ☑ Step 3 — `.env.example` (+ `.gitignore` `!.env.example`); vars documented in README
- ☑ Step 4 — Smoke test passed (`/api/supabase-health` → `{ok:true, connected:true}`); throwaway route removed

### 0.5 App shell ☑

- ☑ Step 1 — Mobile bottom nav (Fixtures / Leaderboard / Profile) + `(app)` group with placeholder routes
- ☑ Step 2 — Responsive desktop layout (header `MainNav` at md+, fixed `BottomNav` on mobile)
- ☑ Step 3 — Loading + empty-state primitives (`Skeleton`, `EmptyState`)
- ☑ Step 4 — Verified routes/redirect/dir in `ar`+`en` via curl; responsive via `md:` utilities

---

## Phase 1 — Authentication

> Goal: a family member can register and log in with an email code, and has a
> profile. Registration is **open** (per decision §4.3).

### 1.0 Profiles table + RLS ☑

- ☑ Step 1 — Versioned `0001_profiles.sql` migration creates `profiles`
- ☑ Step 2 — RLS: authenticated read, own insert, own update, no delete
- ☑ Step 3 — Column grants prevent users from updating `is_admin`
- ☑ Step 4 — Owner applied the migration in the Supabase SQL editor; RLS confirmed

### 1.1 Email OTP flow ☑

- ☑ Step 1 — Email entry screen → `signInWithOtp`
- ☑ Step 2 — Code verification screen → session established
- ☑ Step 3 — Error/resend handling; localized copy
- ☑ Step 4 — Verified full round-trip with a real email

### 1.2 Profile setup ☑

- ☑ Step 1 — `profiles` row creation on first login (full name required)
- ⊘ Step 2 — Optional avatar upload deferred; `avatar_url` exists but is unused
- ☑ Step 3 — Edit profile (name, locale)

### 1.3 Sessions & route protection ☑

- ☑ Step 1 — Middleware: gate app routes behind auth
- ☑ Step 2 — Sign-out
- ☑ Step 3 — Redirect logic (unauth → login, incomplete profile → setup)

---

## Phase 2 — Data model & admin entry

> Goal: the database exists with privacy enforced, teams + fixtures are loaded,
> and the admin can run the tournament by hand.
>
> **Decisions locked 2026-06-13:** seed data is **web-fetched** from the official
> FIFA 2026 schedule and **owner-verified before commit**; already-kicked-off
> matches are seeded with their **real final scores as display-only** results (not
> scored); the owner gets admin via a **manual one-off SQL `UPDATE`** after first
> login (no email baked into the schema). Phase 1 is live, so **each migration /
> policy is verified against the live DB** as it lands. Migrations continue the
> `000N_*.sql` series (paste into the SQL editor, in order).

### 2.1 Schema migrations — `0002_core_schema.sql` ☑

- ☑ Step 1 — Created `teams`, `matches`, `predictions`, `app_settings` (+ shared
`set_updated_at()` trigger). RLS is **enabled deny-all on all four in `0002`** so
they stay locked until `0003` adds policies. `matches` keeps stored `status` +
`match_number` (1–104); the privacy gate keys on `kickoff_at`, never `status`.
- ☑ Step 2 — Constraints (`UNIQUE(user_id, match_id)`; non-negative score `CHECK`s;
`stage`/`status` `CHECK`s) + indexes (`predictions(match_id)`,
`matches(kickoff_at)`, `matches(stage)`).
- ☑ Step 3 — `app_settings` singleton (`id = 1`) seeded with 7 / 4 / 2.
- ☑ Step 4 — **Admin grant** one-off `UPDATE` documented in `supabase/README.md`
and applied live; admin confirmed.

### 2.2 RLS policies — `0003_core_rls.sql` ☑

- ☑ Step 1 — `public.is_admin()` SECURITY DEFINER helper (`set search_path = public`)
reads `profiles` without RLS recursion; `execute` granted to `authenticated`.
- ☑ Step 2 — `predictions` policies: SELECT own-or-after-kickoff; INSERT/UPDATE own
& **pre-kickoff only**. **Column grants** restrict member writes to
`home_score`/`away_score` (+ `user_id`/`match_id` on insert) so `points_awarded`
can never be self-set — same pattern as `profiles.is_admin`.
- ☑ Step 3 — `teams` / `matches` / `app_settings`: SELECT for all authenticated;
admin `for all` write policy via `is_admin()` (admin writes run as the admin user,
RLS-enforced — no service-role needed).
- ☑ Step 4 — **Verify privacy live:** a second account cannot read a pre-kickoff
prediction, and can once `now() >= kickoff_at`; a member cannot self-set
`points_awarded`.

### 2.3 Seed teams & full schedule — `0004_seed_teams.sql`, `0005_seed_matches.sql` ⊘

> **Superseded 2026-06-14 by 2.6 (data sync).** First deferred (owner chose
> UI-first; web sources were too inconsistent), then resolved by syncing from the
> openfootball `worldcup.json` feed instead — see §2.6. The manual `0004`/`0005` seed
> was **not written**; these steps won't be executed (kept for history).

- ☐ Step 1 — 48 teams, groups A–L (en + ar names, FIFA codes, flags); web-fetched,
owner-verified. The match seed references teams by `code` lookup.
- ☐ Step 2 — Full official **104-match** schedule (group + knockout), kickoff
converted venue-local → UTC, `match_number` 1–104; **verify against FIFA before
commit**.
- ☐ Step 3 — Knockout fixtures seeded with `home_label`/`away_label` where teams
are still TBD (team ids null).
- ☐ Step 4 — Already-kicked-off matches seeded with **real final scores +
`status = 'finished'`** (display-only); confirm the kickoff rule auto-locks them
so no one can predict or be scored on them — no special flag needed.

### 2.4 Admin: fixtures & teams ☑

- ☑ Step 1 — Admin-only `(app)/admin` area: middleware `/admin` route gate + server
`is_admin` layout gate (non-admins → `/fixtures`); header "Admin" link shown only
to the admin; sub-nav (Fixtures / Results / Teams). Client-safe constants/types
split into `src/lib/match-types.ts`; data/format helpers in
`src/lib/{teams,matches,match-format}.ts`.
- ☑ Step 2 — **Teams CRUD** (added because the seed is deferred — owner enters data
via the UI): list + add + edit (name en/ar, FIFA code, flag, group).
- ☑ Step 3 — **Fixtures CRUD**: list grouped by stage + add/edit (stage, group,
home/away team **or** TBD label, kickoff entered/stored UTC, venue, match number).
Assigning a knockout slot = switching a side from its label to a team.

### 2.5 Admin: results & scoring — `0006_scoring.sql` ☑

- ☑ Step 1 — Results tab: per-match score entry (+ optional shootout winner,
display-only) and a clear-result action.
- ☑ Step 2 — `public.score_match()` (SECURITY DEFINER, reads `app_settings`) + a
BEFORE trigger (scores → `status`) and an AFTER trigger (rescore the match's
predictions), signed-GD logic per §5. *(This is the Phase 4.1 scoring function,
built here because results entry drives it; 4.1 then becomes the worked-example
unit check, not a second implementation.)*
- ☑ Step 3 — Idempotent recompute on a corrected score; clearing the scores resets
`points_awarded` to null (and `status` back to `scheduled`).
- ☑ **Owner:** applied `0006` live and verified the §5 worked examples (actual
2-1: 2-1→7, 3-2→4, 1-0→4, 3-0→2, 1-2→0).

### 2.6 World Cup sync (openfootball worldcup.json) — `0007_api_sync.sql` ◐

> Resolves 2.3 by syncing teams/fixtures/results from the **openfootball
> worldcup.json** feed instead of a hand seed. Free, public, no key, and it covers
> **all 104 matches of WC2026 today** (a paid sports API's free tier doesn't include
> season 2026 — that gap is why this feed replaced API-Football, 2026-06-14). Result
> pulls capped at **≤30/day**. (Reverses §4.2's original "no external API in v1",
> per owner request.)

- ☑ Step 1 — `0007`: `api_fixture_id` (stable external upsert key) + `sync_runs` log.
- ☑ Step 2 — Feed client `src/lib/sync/openfootball.ts` + logic
`src/lib/sync/world-cup.ts`: `syncSchedule` (seed 48 teams keyed on FIFA `code`,
group letters from group matches, all 104 matches) and `syncResults` (1 fetch). The
feed differs from a typed API, so the adapter: resolves teams by **English name →
code**; converts the feed's local-offset kickoff (`"13:00 UTC-6"`) → **UTC**; keys
upserts on `api_fixture_id` = knockout `num` (73–104) or a **stable hash** of the
group + team pair (group matches carry no id); infers `status` from full-time
presence (no "live" in the feed); writes scores only when finished → `0006` trigger
→ auto-score; leaves unresolved knockout slots TBD with an **Arabic** `home/away_label`
(e.g. "وصيف المجموعة B", "الفائز من المباراة 74") that fills in as the bracket resolves.
- ☑ Step 3 — Protected `POST /api/sync` (Bearer `CRON_SECRET` + ≤30/day cap) + admin
**Sync** tab (Full sync / Sync results + last-run log). Service-role writes.
- ☑ Step 4 — **Owner:** applied `0007`/`0008`, set `CRON_SECRET` in `.env.local`,
ran **Full sync** via the Sync tab, and confirmed **48 teams / 104 matches** with
admin access granted.
- ◐ Step 5 — Deploy (Phase 5): committed `.github/workflows/sync.yml`, an external
GitHub Actions scheduler for `POST /api/sync`. It calls twice per fixture
(kickoff +55m, then a post-match window) with a current max of 12 calls/day.
Owner still needs to set Actions secrets (`SYNC_URL`, `CRON_SECRET`) after the
Vercel URL exists and run it once.

---

## Phase 3 — Predictions

> Goal: members predict scores, edit until kickoff, and can't peek at others'
> picks early.

### 3.1 Fixtures list ☑

- ☑ Step 1 — Fixtures grouped by date, localized, with Upcoming / Finished tabs
- ☑ Step 2 — Kickoff shown in device-local time; clear "closes at kickoff" state
- ☑ Step 3 — Upcoming matches are predictable; past/locked matches render as
results-only (no prediction input)

### 3.2 Predict / edit ☑

- ☑ Step 1 — Score stepper UI per match
- ☑ Step 2 — Create/update prediction (blocked at/after kickoff, enforced by RLS)
- ☑ Step 3 — "Saved" / "locked" states

### 3.3 Privacy & reveal ☑

- ☑ Step 1 — Before kickoff: only my prediction is visible
- ☑ Step 2 — At/after kickoff: everyone's predictions for that match are shown
- ☑ Step 3 — Verify against RLS (UI must not assume; DB is the gate)

---

## Phase 4 — Scoring & leaderboard

> Goal: points appear after results, and the shared board ranks everyone.

### 4.1 Scoring function ☑

- ☑ Step 1 — SQL function: exact 7 / signed-GD 4 / winner 2 / 0, reading `app_settings` (delivered early in 2.5 via `0006_scoring.sql`)
- ☑ Step 2 — Apply to all predictions of a scored match; idempotent (delivered early in 2.5 via `0006_scoring.sql`)
- ☑ Step 3 — Rollback-wrapped SQL unit check for the worked examples from `PROJECT-CONTEXT.md` §5 (`supabase/tests/0006_scoring_examples.sql`)

### 4.2 Leaderboard ☑

- ☑ Step 1 — Aggregate leaderboard RPC (`0008_leaderboard.sql`) with totals, shared `rank()`, exact-count tie-break, predictions made, and per-tier counts
- ☑ Step 2 — Leaderboard page with initials avatars, ranks, current-user highlight, full per-tier stats, and tap-any-row member breakdown links

### 4.3 My results ☑

- ☑ Step 1 — Shared per-user breakdown component: prediction vs actual + points earned, reused by the Leaderboard "My results" tab, member pages, and Profile link

---

## Phase 5 — Polish & deploy

### 5.1 UX polish ☑

- ☑ Step 1 — Skeletons, empty states, toasts
- ☑ Step 2 — RTL/LTR pass across all screens

### 5.2 Deploy ◐

- ◐ Step 1 — Vercel project + env vars: local pre-flight build/lint clean and env
  template verified; owner to create the Hobby project, set Production env vars,
  deploy, and record `https://<app>.vercel.app`.
- ◐ Step 2 — Supabase prod settings: reuse the existing project; owner to set Site
  URL to `https://<app>.vercel.app`, add redirect URL
  `https://<app>.vercel.app/**`, and confirm Email/Magic Link settings.
- ◐ Step 3 — Production smoke test: checklist ready; owner to run after deploy
  (ar/en, mobile/desktop, OTP, profile toast, fixtures/predictions/privacy,
  leaderboard, admin Sync, scheduled Action log).
- ☑ Step 4 — External scheduler repo artifact: `.github/workflows/sync.yml`
  provides scheduled + manual GitHub Actions runs against `/api/sync`. The schedule
  is match-aware: kickoff +55m for a half-time check, then kickoff +125m for group
  matches or +170m for knockouts so extra time/penalties can finish. Current max
  is 12 calls/day, under the server-side 30/day cap.

### 5.3 QA ☐

- ☐ Step 1 — Mobile sizes (small Android ↔ large iPhone) + desktop
- ☐ Step 2 — Privacy edge cases (kickoff boundary, timezone)
- ☐ Step 3 — Full predict → score → leaderboard dry run with 2+ accounts

---

## How to update this file

After each coding execution:

1. Flip the step/item markers you completed (☐ → ◐ → ☑).
2. Move the **Current Position** pointer.
3. Add or re-order items if reality differed from the plan (note why).
4. Append a dated entry to `[CHANGELOG.md](./CHANGELOG.md)`.
