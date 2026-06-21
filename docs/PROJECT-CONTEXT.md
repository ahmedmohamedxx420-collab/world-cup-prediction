# Project Context — FIFA World Cup Prediction

> **Single source of truth.** Read this before writing any code. If something here
> is wrong or out of date, fix it here first, then build to match.
>
> **Last updated:** 2026-06-20 (rev 26) · **Status:** Email + password auth is the default; admin-driven password reset is repo-implemented, live `0011` apply/fresh-start wipe still pending

---

## 1. Objective

A private, mobile-first web app where one family group predicts FIFA World Cup
match scores and competes on a single shared leaderboard. Users submit a score
prediction before kickoff; after the real result is known, points are awarded by
how close the prediction was.

One sentence: **Predict the score, earn points by accuracy, climb one shared board.**

---

## 2. Users & Scope

- **One private family group.** No multiple groups, no group admins, no
  invitations, no member management.
- **One shared leaderboard** for everyone.
- **One admin** (the site owner) who enters fixtures and final scores.
- World Cup only. No other competitions.
- **In scope:** email + password login, admin-driven password reset, score predictions (editable until kickoff),
  prediction privacy before kickoff, simple accuracy-based scoring, one
  leaderboard, Hall of Fame aggregate award badges, per-player stats cards,
  manual score entry plus openfootball result sync, Arabic + English.
- **Out of scope (for now):** reminders/notifications, multiple groups, deeper
  analytics beyond the current Hall of Fame badge set.

---

## 3. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Deployed on Vercel, zero-config |
| Styling | **Tailwind CSS + shadcn/ui** | Mobile-first; clean sports-app look |
| Backend / DB | **Supabase** | Postgres + Auth + Storage + RLS |
| Auth | **Switchable (§4.11)** | Default email + password; `"phone"` = legacy no-verification phone sign-in, `"otp"` = legacy Supabase email OTP |
| i18n | **next-intl** | Arabic default + RTL, English secondary |
| Hosting | **Vercel** | One-click Next.js deploys |

---

## 4. Key Product Decisions

These were confirmed with the owner. Change them *here* if they change.

1. **Scoring = precision-heavy.** Exact 7 / correct goal-difference 4 / correct
   winner 2 / miss 0. (See §5.) Numbers live in an `app_settings` row so they can
   be tuned without a redeploy.
2. **Match data = openfootball worldcup.json sync** (added 2026-06-14 per owner
   request; originally planned manual-only). Teams, fixtures, and results sync from
   the free public `openfootball/worldcup.json` GitHub feed (override via
   `WORLDCUP_FEED_URL`); the admin can still hand-edit via the Teams/Fixtures/Results
   tabs. **No key and no paid/season plan** — the feed covers all 104 matches of
   WC2026 today and updates scores live. (It replaced an earlier API-Football design
   on 2026-06-14: that provider's free tier excludes season 2026, so it couldn't pull
   real data.) Result pulls are **capped at 30/day**. Production scheduling is a
   repo-committed GitHub Actions external cron that calls `POST /api/sync` with
   `SYNC_URL` + `CRON_SECRET` twice per fixture: kickoff +55m for a half-time
   check, then kickoff +125m for group matches or +170m for knockouts so extra
   time/penalties can finish. The current WC2026 schedule peaks at 12 calls/day.
   Vercel Cron is not used on Hobby because its once/day limit is too coarse.
   Final scores from the sync flow through the scoring trigger (§5) and
   auto-score predictions.
3. **Registration = open.** Anyone with the link can register (email + password, then full name/profile photo/locale).
   - *Implication:* the leaderboard is only as private as the URL. A shared
     invite-code gate is a documented, low-effort future enhancement (see §10) if
     the owner later wants to lock it down.
4. **Knockout scoring = official full-time score including extra time.** Penalty
   shootouts are **not** scored. A prediction is scored against the score after
   extra time. (So a user who predicts 1-1 on a match that finished 1-1 a.e.t. and
   went to penalties still gets the exact-score points; who advanced on penalties
   does not affect points.)
5. **Admin accounts = `ahmed.mohamed.xx420@gmail.com` and phone
   `+966595440204`.** Admins also compete (submit predictions and appear on the
   leaderboard).
6. **Tournament data is synced.** All 48 teams (groups A–L) and the full
   **104-match** schedule (real fixtures + kickoff times) load via the openfootball
   sync (§4.2); the admin can hand-edit and enters/syncs results going forward.
   Venue-local kickoff times are stored as **UTC**.
7. **Launching mid-tournament.** As of 2026-06-12 the World Cup is already underway
   (it began 2026-06-11). Matches whose kickoff has already passed are
   **results-only**: the kickoff rule auto-closes predictions for them, so nobody
   can predict or be scored on them. The leaderboard effectively starts from the
   next upcoming match; late joiners start at 0. *No extra schema needed* — the
   existing `now() >= kickoff_at` gate handles this. Already-kicked-off matches are
   **seeded with their real final scores** (display-only) so history renders
   correctly; those matches are never scored.
8. **No tournament-long bonus picks in v1.** Per-match score predictions only. A
   "predict the champion" / top-scorer bonus is explicitly deferred.
9. **Legacy email OTP is a typed six-digit code.** Only when
   `NEXT_PUBLIC_AUTH_MODE=otp`, the Supabase **Magic Link** email template must
   display `{{ .Token }}`; a confirmation-link-only template does not support the
   app's two-step code form. The default password flow sends no email code.
10. **Prediction UX = detail-page loop.** The member Fixtures page is grouped by
    date with **Upcoming** and **Finished** tabs, plus an **Ongoing** tab that is
    shown only while live matches exist. The default landing tab remains
    **Upcoming**, even when Ongoing is available. **Upcoming** shows only the next
    not-yet-started *batch* — matches within 24h of the earliest upcoming one —
    so the list stays focused on what to predict next (far-future fixtures appear
    once they enter that window). A match that has kicked off but has **no final
    score yet is "in progress"**: it appears in Ongoing as the prominent
    stadium-style banner (never duplicated in Upcoming, never in Finished).
    Opening `/fixtures?tab=ongoing` when there are no live matches falls back to
    Upcoming. **Finished** lists only matches with a final score
    (`status = finished` or both scores set). Each row links to a per-match detail
    page; open matches use +/- score steppers that autosave after the user's first
    interaction (no accidental 0-0 write on page load) and confirm with an
    animated inline status pill. Kickoff is rendered in the browser's local
    timezone. TBD knockout slots are read-only until both teams are assigned.
    After kickoff, the detail page renders the prediction rows returned by RLS and
    highlights the current user's row; the UI does not act as the privacy gate.
    (Login hard-navigates after OTP verify so the app loads without a manual
    refresh.)
11. **Auth mode is switchable (`NEXT_PUBLIC_AUTH_MODE`).** Default/unset
    `"password"`: email + password, no OTP and no confirmation email. Signup uses
    the service-role admin client to create a confirmed Supabase auth user, signs
    in with the cookie-bound server client, then sends the new user to onboarding
    (name + optional avatar + locale). Login is email-first: an unknown email
    redirects to `/signup?email=…` (prefilled); normal accounts ask for the
    password; accounts with `profiles.password_reset_pending = true` ask for a
    new password instead of the old one. Symmetrically, signing up with an email
    that already has an account redirects to `/login?email=…` rather than
    erroring. The shared lookup lives in `src/lib/auth/users.ts`. Admin reset is intentionally manual for this private app:
    `/admin/users` lets the admin mark a profile pending and scramble the old
    password; the next login sets a new one. The pending-claim window is accepted
    as part of the app's trusted-family security posture. Set the flag to
    `"phone"` to restore the legacy no-verification phone sign-in, or `"otp"` to
    restore the original Supabase email six-digit-code flow. **How every mode
    preserves RLS:** all policies key off `auth.uid()`, so every successful path
    still mints a real Supabase session. Owner email
    `ahmed.mohamed.xx420@gmail.com` and legacy phone `+966595440204` are
    auto-promoted after their profile exists; the shared profile read also
    self-heals those flags for already signed-in sessions. Lives in
    `src/lib/auth/mode.ts`, `(auth)/signup/*`, `(auth)/login/password-*`, and the
    legacy phone/OTP login files.
12. **Leaderboard personality stats = Hall of Fame cards.** The leaderboard stays
    on one bottom-nav item, with three tabs: Board, Hall of Fame, and My results.
    Hall of Fame shows 8 named aggregate badges: Sniper, Hot Streak, On Form,
    Sharpshooter, Last-Minute Larry, Goal Machine, The Wall, and So Close. Badge
    winners are selected in TypeScript from aggregate per-user rows; ties use
    higher total points, then `full_name` ascending. Per-player breakdowns also
    show form dots, current/best streak, favourite scoreline, and best match.

---

## 5. Scoring Rules (precise)

Let the **actual** result be `(ah, aa)` (home, away) and the **prediction** be
`(ph, pa)`. Goal difference is **signed**: `gd = home − away`. Tendency is the
sign of `gd`: home win (`>0`), draw (`0`), away win (`<0`).

Evaluate top-down; first match wins:

| Tier | Condition | Points |
|---|---|---|
| Exact | `ph == ah` **and** `pa == aa` | **7** |
| Goal difference | `(ph − pa) == (ah − aa)` (signed; implies correct tendency) | **4** |
| Winner / tendency | `sign(ph − pa) == sign(ah − aa)` | **2** |
| Miss | otherwise | **0** |

**Worked examples — actual result `2-1`:**

| Prediction | Result | Points |
|---|---|---|
| 2-1 | exact | 7 |
| 3-2 | correct signed GD (+1) | 4 |
| 1-0 | correct signed GD (+1) | 4 |
| 3-0 | correct winner, wrong GD | 2 |
| 1-2 | wrong winner | 0 |

**Draws** are handled entirely through the goal-difference logic (a draw is
`gd == 0`): actual `1-1`, predict `2-2` → correct GD → **4**; predict `1-1` →
exact → **7**; predict `2-1` → wrong tendency → **0**. There is **no** separate
draw rule.

> Note: "correct goal difference" means the **signed** difference. Actual `2-1`
> (GD +1) vs predict `1-2` (GD −1) is **not** a GD match — it's the wrong winner.

Scoring runs when the admin records a match's final score (match becomes
`finished`). It is deterministic and re-runnable (re-entering a corrected score
recomputes every prediction for that match).

---

## 6. Data Model (Supabase / Postgres)

API-ready, manual-entry-first. Names are the working spec; finalize in migrations.

### `profiles` (extends `auth.users`)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | = `auth.users.id` |
| `full_name` | text, not null | required at signup |
| `avatar_url` | text, null | optional; Supabase Storage |
| `is_admin` | bool, default false | single owner = true |
| `password_reset_pending` | bool, default false | admin-set manual reset flag |
| `locale` | text, default `'ar'` | UI preference |
| `created_at` | timestamptz | |

Created in Phase 1 by `supabase/migrations/0001_profiles.sql`; `0011` adds
`password_reset_pending`. The app inserts the row during onboarding; an
authenticated user with no row has an incomplete profile. Avatar upload writes
`avatar_url` through the profile forms. Members can update only
`full_name`/`avatar_url`/`locale`; `is_admin` and `password_reset_pending` are
service-role/admin-managed.

### `teams`
| Column | Type | Notes |
|---|---|---|
| `id` | serial/uuid PK | |
| `name_en`, `name_ar` | text | localized names |
| `code` | text | FIFA 3-letter (e.g. `ARG`) |
| `flag` | text, null | emoji or asset key |
| `group_letter` | text, null | A–L (2026 has 12 groups) |
| `api_team_id` | bigint, unique, null | legacy API-Football key; **unused** by the openfootball sync (teams upsert on `code`) |

### `matches`
| Column | Type | Notes |
|---|---|---|
| `id` | serial/uuid PK | |
| `stage` | text | `group` \| `round_32` \| `round_16` \| `quarter` \| `semi` \| `third_place` \| `final` |
| `group_letter` | text, null | for group stage |
| `home_team_id` / `away_team_id` | FK→teams, null | null while a knockout slot is TBD |
| `home_label` / `away_label` | text, null | e.g. "Winner Group A" before teams are known |
| `kickoff_at` | timestamptz, not null | **stored UTC**; predictions close at this instant |
| `venue` | text, null | |
| `status` | text | `scheduled` \| `live` \| `finished` (or derived from time + score) |
| `home_score` / `away_score` | int, null | **official full-time incl. extra time**; the score used for scoring |
| `shootout_winner_team_id` | FK→teams, null | **display only, never scored** |
| `api_fixture_id` | bigint, unique, null | stable external sync upsert key: knockout FIFA `num` (73–104), or a hash of the group + team pair for group matches |
| `created_at` / `updated_at` | timestamptz | |

### `predictions`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | FK→profiles | |
| `match_id` | FK→matches | |
| `home_score` / `away_score` | int, not null | the user's predicted score |
| `points_awarded` | int, null | null until the match is scored |
| `created_at` / `updated_at` | timestamptz | |
| — | UNIQUE(`user_id`,`match_id`) | one prediction per user per match |

### `app_settings` (singleton row)
| Column | Type | Default |
|---|---|---|
| `id` | int PK | `1` |
| `exact_points` | int | `7` |
| `goal_diff_points` | int | `4` |
| `winner_points` | int | `2` |

### `sync_runs` (operational log)
One row per sync run (`kind` `schedule`|`results`, `ran_at`, `ok`,
`fixtures_upserted`, `error`). Powers the admin Sync tab's history and the
server-side ≤30/day cap. Admin-readable; written by the service-role sync job.

### Leaderboard (view)
Implemented by `public.get_leaderboard()` in `0008_leaderboard.sql`: a
`SECURITY DEFINER` function with a pinned `search_path` that bypasses prediction
RLS only to compute aggregate totals across all users. It returns aggregates only:
total points, predictions made, scored count, exact / goal-difference / winner /
miss counts, and shared `rank()` values. Tier classification reads
`app_settings`, the same source as `score_match()`. Order: total **desc**, then
exact-count **desc**, then `full_name`.

Per-member result breakdowns are intentionally **not** returned by the aggregate
function. The app reads `predictions` normally for a selected `user_id`, so RLS
continues to hide another member's pre-kickoff picks while the current user can
see their own full history.

### Member stats (aggregate)
Implemented by `public.get_member_stats()` in `0009_member_stats.sql`: a
`SECURITY DEFINER` function with pinned `search_path`, same privacy posture as
`get_leaderboard()`. It returns one aggregate row per profile:
total/scored/exact/GD/winner/miss counts, `exact_points`, longest scoring streak,
last-5 scored points, average predicted goals (`avg_goals_x100`), and average
lead time before kickoff (`avg_lead_seconds`). It never returns prediction ids,
match ids, individual scorelines, or individual timestamps.

The Hall of Fame tab computes winners from those aggregate rows in
`src/lib/hall-of-fame.ts`. A badge is only awarded when a holder qualifies (for
example, Sharpshooter needs at least 5 scored predictions); otherwise its card
renders a muted "not yet awarded" state.

---

## 7. Security & Privacy Model (RLS — non-negotiable)

Prediction privacy is enforced at the **database layer** with Row Level Security,
not just in the UI, so the API can never leak a hidden prediction.

- **`predictions` SELECT:** a row is visible if it's **yours**, *or* if its match
  has already kicked off (`now() >= matches.kickoff_at`). This is the core privacy
  gate — nobody sees anyone else's pick before kickoff.
- **`predictions` INSERT/UPDATE:** only your own row, and only while
  `now() < matches.kickoff_at` (predictions close at kickoff).
- **`profiles`:** everyone (authenticated) can read names/avatars (leaderboard);
  you can insert/update only your own row. Column grants exclude `is_admin` and
  `password_reset_pending`, so owning a row cannot be used to self-promote or
  self-trigger a reset. There is no user DELETE policy.
- **`teams` / `matches` / `app_settings`:** read for all authenticated users;
  write only for admins (`is_admin = true`, checked via a `SECURITY DEFINER`
  helper to avoid RLS recursion).
- **Aggregate leaderboard RPCs:** `get_leaderboard()` and `get_member_stats()`
  are `SECURITY DEFINER` functions that bypass prediction RLS only to compute
  cross-user aggregates. They expose no individual prediction rows, no match ids,
  and no per-match scorelines; member breakdown pages still read `predictions`
  through normal RLS-bound selects.
- **App routes:** the Next.js proxy refreshes Supabase auth cookies and redirects
  unauthenticated app requests to login. The app layout redirects authenticated
  users without a `profiles` row to onboarding.

---

## 8. Internationalization & Design

- **Arabic is the default locale**, casual tone. English is secondary.
- `dir="rtl"` on `<html>` for Arabic; `ltr` for English.
- Use Tailwind **logical properties** (`ps-`/`pe-`, `ms-`/`me-`, `text-start`/
  `text-end`) so the layout mirrors automatically — avoid `pl-`/`pr-`/`left`/`right`.
- **Mobile-first.** Design for phones (Android + iPhone, varied sizes) first,
  then scale up to desktop. Expect a bottom nav on mobile.
- "Clean sports app" aesthetic via shadcn/ui components (green primary accent).
- UI font: **Tajawal** (Arabic + Latin), loaded via `next/font/google`.
- **Feedback UX:** discrete successful writes use RTL-aware Sonner toasts mounted
  `top-center` so they clear the mobile bottom nav. Redirecting server actions
  pass success via `?toast=...` flash params that are stripped after display.
  Contextual validation errors stay inline beside the form fields, and prediction
  autosave keeps its inline `role="status"` (an animated saving/saved status pill)
  instead of showing a toast per change.

---

## 9. Roles

- **Member:** register, set profile, predict, view leaderboard, view others'
  predictions after kickoff.
- **Admin (`ahmed.mohamed.xx420@gmail.com` and phone `+966595440204`):**
  everything a member can do (so admins also predict and appear on the
  leaderboard), plus manage fixtures/teams/users, enter final scores (which
  triggers scoring), reset member passwords manually, and use the **Sync** tab to
  pull teams/fixtures/results from the openfootball feed. Admin UI is
  intentionally minimal in v1.

---

## 10. Assumptions & Deferred Items

Documented defaults (change here if the owner decides otherwise):

- **Timezones:** kickoff stored in UTC; the gate (`now() >= kickoff_at`) is
  timezone-agnostic. Times are **displayed in the user's device-local timezone**.
- **Reminders / notifications:** not built.
- **Automated result scheduler:** repo artifact built in
  `.github/workflows/sync.yml` as a GitHub Actions external cron calling
  `POST /api/sync` with `SYNC_URL` + `CRON_SECRET`; it is match-aware, with one
  half-time check at kickoff +55m and one post-match check (+125m for group
  matches, +170m for knockouts). Current peak is 12 calls/day, under the 30/day
  server cap. Owner still needs to add the Actions secrets after Vercel assigns
  the production URL and trigger the workflow once. cron-job.org remains the more
  punctual fallback if GitHub schedule drift is a problem.
- **Invite-code registration gate:** not built (registration is open per decision
  §4.3). Low-effort future enhancement if privacy needs tightening.
- **Account deletion / admin user removal:** not in v1 unless requested.
- **Admin grant:** the owner email `ahmed.mohamed.xx420@gmail.com` and legacy
  phone `+966595440204` are auto-promoted in server actions/profile reads once
  their `profiles` row exists. No one-off SQL grant is needed.
- **Fresh-start auth wipe:** requested for this auth switch, but not run by code.
  With explicit owner go-ahead, delete all rows from `auth.users`; profile and
  prediction rows cascade, while synced teams/fixtures/results/app settings stay.
- **Knockout TBD fixtures:** created with `home_label`/`away_label` placeholders;
  predictions open once both teams are assigned.
- **Mid-tournament launch:** matches whose kickoff has already passed are
  results-only — the kickoff rule auto-closes predictions, so there's no
  retroactive predicting or back-crediting. Late joiners start at 0.
- **Leaderboard membership:** the board lists all registered profiles, including
  members with zero predictions / zero points. For a small family group, zeros are
  visible by default rather than hiding non-predictors.
- **Leaderboard breakdowns:** tapping any leaderboard row opens that member's
  RLS-filtered results. Others' pre-kickoff predictions stay absent because the
  database policy filters them; the current user's "My results" tab and Profile
  card link show their full visible history.
- **Hall of Fame analytics:** the current badge set is intentionally small and
  card-based, not a full analytics table. Future advanced breakdowns remain
  deferred unless the owner asks for them.
- **Seed data:** as of 2026-06-14, teams/fixtures/results are populated by the
  **openfootball worldcup.json sync** (§4.2), which writes UTC kickoff times
  directly; the manual admin CRUD remains a fallback. (The earlier hand-seed /
  `0004`–`0005` plan is superseded and was not written.) No paid plan needed — the
  feed covers WC2026 for free.
- **Tournament-long bonus picks** (champion, top scorer) are out of scope for v1.
- **Profile avatar upload:** deferred; Phase 1 profile setup is name + locale.

---

## 11. Companion Docs

- [`BUILD-PLAN.md`](./BUILD-PLAN.md) — the ordered backlog and exactly where we are.
- [`CHANGELOG.md`](./CHANGELOG.md) — what changed each build, and why.
