# Build Plan — FIFA World Cup Prediction

> **The ordered backlog and exactly where we are.** Build top-to-bottom; each item
> is small enough to finish, verify, and commit on its own. **After every coding
> execution, update the status markers below and the "Current Position" pointer,
> then append a matching entry to `[CHANGELOG.md](./CHANGELOG.md)`.**
>
> **Last updated:** 2026-06-12 (rev 2)

---

## Status legend

- ☐ **To do**
- ◐ **In progress**
- ☑ **Done** (built + verified)
- ⊘ **Blocked / skipped** (note why inline)

## Current Position

➡️ **Phase 0 → Item 0.4 → Supabase wiring.** Docs (0.1), scaffold (0.2), and
i18n+RTL (0.3) all ✅. App routes under `[locale]`; `ar`/RTL default, `en`/LTR,
language switcher working. **0.4 is blocked on owner-supplied Supabase URL + keys**
— I'll scaffold the clients/env and run the live smoke test once they arrive.

---

## Phase 0 — Foundation

> Goal: a running, localized, Supabase-connected Next.js shell with nothing
> business-specific yet.

### 0.1 Project docs ◐

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

### 0.4 Supabase wiring ◐ (code done; live smoke test ⊘ blocked on owner keys)

- ⊘ Step 1 — Create Supabase project; capture URL + anon/service keys — **owner action** (not yet supplied)
- ☑ Step 2 — `@supabase/supabase-js` + `@supabase/ssr`; browser / server / admin clients (`src/lib/supabase/`)
- ☑ Step 3 — `.env.example` (+ `.gitignore` `!.env.example`); vars documented in README
- ⊘ Step 4 — Smoke-test route `GET /api/supabase-health` written; **run once keys are set**, then remove route

### 0.5 App shell ☐

- ☐ Step 1 — Mobile bottom nav (Fixtures / Leaderboard / Profile)
- ☐ Step 2 — Responsive desktop layout
- ☐ Step 3 — Loading + empty-state primitives
- ☐ Step 4 — Verify on small/large viewports

---

## Phase 1 — Authentication

> Goal: a family member can register and log in with an email code, and has a
> profile. Registration is **open** (per decision §4.3).

### 1.1 Email OTP flow ☐

- ☐ Step 1 — Email entry screen → `signInWithOtp`
- ☐ Step 2 — Code verification screen → session established
- ☐ Step 3 — Error/resend handling; localized copy
- ☐ Step 4 — Verify full round-trip with a real email

### 1.2 Profile setup ☐

- ☐ Step 1 — `profiles` row creation on first login (full name required)
- ☐ Step 2 — Optional avatar upload to Supabase Storage
- ☐ Step 3 — Edit profile (name, avatar, locale)

### 1.3 Sessions & route protection ☐

- ☐ Step 1 — Middleware: gate app routes behind auth
- ☐ Step 2 — Sign-out
- ☐ Step 3 — Redirect logic (unauth → login, incomplete profile → setup)

---

## Phase 2 — Data model & admin entry

> Goal: the database exists with privacy enforced, teams + fixtures are loaded,
> and the admin can run the tournament by hand.

### 2.1 Schema migrations ☐

- ☐ Step 1 — `profiles`, `teams`, `matches`, `predictions`, `app_settings`
- ☐ Step 2 — Constraints (unique prediction per user/match) + indexes
- ☐ Step 3 — `app_settings` singleton seeded with 7 / 4 / 2
- ☐ Step 4 — Grant admin to the owner (`ahmed.mohamed.xx420@gmail.com`): trigger on
profile creation, or a one-off update after first login

### 2.2 RLS policies ☐

- ☐ Step 1 — `is_admin()` SECURITY DEFINER helper
- ☐ Step 2 — `predictions` policies (own-or-after-kickoff SELECT; pre-kickoff own INSERT/UPDATE)
- ☐ Step 3 — `profiles` / `teams` / `matches` / `app_settings` policies
- ☐ Step 4 — **Verify privacy**: a second user cannot read pre-kickoff predictions

### 2.3 Seed teams & full schedule ☐

- ☐ Step 1 — 48 teams, groups A–L (en + ar names, codes, flags)
- ☐ Step 2 — Seed the full official **104-match** schedule (group + knockout),
kickoff times converted venue-local → UTC; verify against FIFA
- ☐ Step 3 — Knockout fixtures seeded with `home_label`/`away_label` where teams
are still TBD
- ☐ Step 4 — Confirm already-kicked-off matches are auto-locked (results-only) by
the kickoff rule — no special flag needed

### 2.4 Admin: fixtures ☐

- ☐ Step 1 — List/create/edit fixtures (teams, stage, kickoff, venue)
- ☐ Step 2 — Assign teams to knockout slots as they're decided

### 2.5 Admin: results & scoring trigger ☐

- ☐ Step 1 — Enter final score (incl. extra time) + optional shootout winner
- ☐ Step 2 — Setting the score marks match `finished` and runs scoring
- ☐ Step 3 — Re-entering a corrected score recomputes cleanly

---

## Phase 3 — Predictions

> Goal: members predict scores, edit until kickoff, and can't peek at others'
> picks early.

### 3.1 Fixtures list ☐

- ☐ Step 1 — Fixtures grouped by stage/matchday, localized
- ☐ Step 2 — Kickoff shown in device-local time; clear "closes at kickoff" state
- ☐ Step 3 — Upcoming matches are predictable; past/locked matches render as
results-only (no prediction input)

### 3.2 Predict / edit ☐

- ☐ Step 1 — Score stepper UI per match
- ☐ Step 2 — Create/update prediction (blocked at/after kickoff, enforced by RLS)
- ☐ Step 3 — "Saved" / "locked" states

### 3.3 Privacy & reveal ☐

- ☐ Step 1 — Before kickoff: only my prediction is visible
- ☐ Step 2 — At/after kickoff: everyone's predictions for that match are shown
- ☐ Step 3 — Verify against RLS (UI must not assume; DB is the gate)

---

## Phase 4 — Scoring & leaderboard

> Goal: points appear after results, and the shared board ranks everyone.

### 4.1 Scoring function ☐

- ☐ Step 1 — SQL function: exact 7 / signed-GD 4 / winner 2 / 0, reading `app_settings`
- ☐ Step 2 — Apply to all predictions of a scored match; idempotent
- ☐ Step 3 — Unit-check the worked examples from `PROJECT-CONTEXT.md` §5

### 4.2 Leaderboard ☐

- ☐ Step 1 — Leaderboard view (total, exact-count tie-break, predictions made)
- ☐ Step 2 — Leaderboard page with avatars, ranks, my-row highlight

### 4.3 My results ☐

- ☐ Step 1 — Per-user breakdown: each prediction vs actual + points earned

---

## Phase 5 — Polish & deploy

### 5.1 UX polish ☐

- ☐ Step 1 — Skeletons, empty states, toasts
- ☐ Step 2 — RTL/LTR pass across all screens

### 5.2 Deploy ☐

- ☐ Step 1 — Vercel project + env vars
- ☐ Step 2 — Supabase prod settings (auth redirect URLs, storage policies)
- ☐ Step 3 — Production smoke test

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

