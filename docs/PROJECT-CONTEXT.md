# Project Context — FIFA World Cup Prediction

> **Single source of truth.** Read this before writing any code. If something here
> is wrong or out of date, fix it here first, then build to match.
>
> **Last updated:** 2026-06-12 (rev 3) · **Status:** Building — Phase 0 (app scaffolded)

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
- **In scope:** email-code login, score predictions (editable until kickoff),
  prediction privacy before kickoff, simple accuracy-based scoring, one
  leaderboard, manual score entry, Arabic + English.
- **Out of scope (for now):** reminders/notifications, multiple groups, advanced
  leaderboard analytics, automated API result sync.

---

## 3. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Deployed on Vercel, zero-config |
| Styling | **Tailwind CSS + shadcn/ui** | Mobile-first; clean sports-app look |
| Backend / DB | **Supabase** | Postgres + Auth (email OTP) + Storage + RLS |
| Auth | **Supabase email OTP** | `signInWithOtp` → enter email → receive code |
| i18n | **next-intl** | Arabic default + RTL, English secondary |
| Hosting | **Vercel** | One-click Next.js deploys |

---

## 4. Key Product Decisions

These were confirmed with the owner. Change them *here* if they change.

1. **Scoring = precision-heavy.** Exact 7 / correct goal-difference 4 / correct
   winner 2 / miss 0. (See §5.) Numbers live in an `app_settings` row so they can
   be tuned without a redeploy.
2. **Match data = manual admin entry.** No external API in v1. The schema is
   designed **API-ready** so auto-sync can be added later without a rewrite.
3. **Registration = open.** Anyone with the link can register (email + full name).
   - *Implication:* the leaderboard is only as private as the URL. A shared
     invite-code gate is a documented, low-effort future enhancement (see §10) if
     the owner later wants to lock it down.
4. **Knockout scoring = official full-time score including extra time.** Penalty
   shootouts are **not** scored. A prediction is scored against the score after
   extra time. (So a user who predicts 1-1 on a match that finished 1-1 a.e.t. and
   went to penalties still gets the exact-score points; who advanced on penalties
   does not affect points.)
5. **Admin account = `ahmed.mohamed.xx420@gmail.com`.** Exactly one admin/owner.
   The admin also competes (submits predictions and appears on the leaderboard).
6. **Tournament data is pre-seeded.** All 48 teams (groups A–L) and the full
   **104-match** schedule (real fixtures + kickoff times) are loaded as seed data;
   the admin only enters results. Venue-local kickoff times are stored as **UTC**.
7. **Launching mid-tournament.** As of 2026-06-12 the World Cup is already underway
   (it began 2026-06-11). Matches whose kickoff has already passed are
   **results-only**: the kickoff rule auto-closes predictions for them, so nobody
   can predict or be scored on them. The leaderboard effectively starts from the
   next upcoming match; late joiners start at 0. *No extra schema needed* — the
   existing `now() >= kickoff_at` gate handles this.
8. **No tournament-long bonus picks in v1.** Per-match score predictions only. A
   "predict the champion" / top-scorer bonus is explicitly deferred.

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
| `locale` | text, default `'ar'` | UI preference |
| `created_at` | timestamptz | |

### `teams`
| Column | Type | Notes |
|---|---|---|
| `id` | serial/uuid PK | |
| `name_en`, `name_ar` | text | localized names |
| `code` | text | FIFA 3-letter (e.g. `ARG`) |
| `flag` | text, null | emoji or asset key |
| `group_letter` | text, null | A–L (2026 has 12 groups) |

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

### Leaderboard (view)
`SUM(points_awarded)` per user, plus `COUNT(*)` of exact hits and predictions
made. Order: total **desc**, then exact-count **desc**, then `full_name`.

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
  you can update only your own.
- **`teams` / `matches` / `app_settings`:** read for all authenticated users;
  write only for admins (`is_admin = true`, checked via a `SECURITY DEFINER`
  helper to avoid RLS recursion).

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

---

## 9. Roles

- **Member:** register, set profile, predict, view leaderboard, view others'
  predictions after kickoff.
- **Admin (single owner — `ahmed.mohamed.xx420@gmail.com`):** everything a member
  can do (so the admin also predicts and appears on the leaderboard), plus manage
  fixtures/teams and enter final scores (which triggers scoring). Admin UI is
  intentionally minimal in v1.

---

## 10. Assumptions & Deferred Items

Documented defaults (change here if the owner decides otherwise):

- **Timezones:** kickoff stored in UTC; the gate (`now() >= kickoff_at`) is
  timezone-agnostic. Times are **displayed in the user's device-local timezone**.
- **Reminders / notifications:** not built.
- **API result sync:** not built; schema is API-ready for a later add.
- **Invite-code registration gate:** not built (registration is open per decision
  §4.3). Low-effort future enhancement if privacy needs tightening.
- **Account deletion / admin user removal:** not in v1 unless requested.
- **Knockout TBD fixtures:** created with `home_label`/`away_label` placeholders;
  predictions open once both teams are assigned.
- **Mid-tournament launch:** matches whose kickoff has already passed are
  results-only — the kickoff rule auto-closes predictions, so there's no
  retroactive predicting or back-crediting. Late joiners start at 0.
- **Seed data:** the 48 teams and 104 fixtures are seeded from the official
  schedule; verify against FIFA at seed time and store venue-local kickoff times
  as UTC.
- **Tournament-long bonus picks** (champion, top scorer) are out of scope for v1.

---

## 11. Companion Docs

- [`BUILD-PLAN.md`](./BUILD-PLAN.md) — the ordered backlog and exactly where we are.
- [`CHANGELOG.md`](./CHANGELOG.md) — what changed each build, and why.
