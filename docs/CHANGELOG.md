# Changelog — FIFA World Cup Prediction

> **Why this file exists:** to give the next coding session an accurate, low-noise
> record of what changed and *why*, so it doesn't re-introduce bugs or undo
> intentional decisions. Append a new entry **after every coding execution**.
>
> **Newest entries on top.** One entry per execution.

### Entry format

```
## YYYY-MM-DD — <short title>
**Plan item:** <e.g. 0.2 Step 3>   **Status:** <done / in progress / blocked>

**What changed**
- bullet points of the actual changes

**Why**
- the reason / decision behind it (especially if non-obvious)

**Files touched**
- path/one
- path/two

**Notes / gotchas**
- anything the next session must know (migrations to run, env vars added, follow-ups)
```

---

## 2026-06-18 — Admin phone auto-promotion
**Plan item:** Auth/admin refinement (owner request)   **Status:** done

**What changed**
- Added a server-only admin-phone allow-list containing `+966595440204`
  (`966595440204` after normalization).
- Phone login now promotes that number's existing profile to `is_admin = true`
  before redirecting to Fixtures.
- Onboarding now promotes that number immediately after its `profiles` row is
  inserted, so first-time phone setup also becomes admin without manual SQL.

**Why**
- Owner requested `+966595440204` to be an admin account in addition to the email
  admin account.

**Files touched**
- src/lib/auth/phone-admin.ts
- src/app/[locale]/(auth)/login/phone-actions.ts
- src/app/[locale]/(auth)/onboarding/actions.ts
- docs/BUILD-PLAN.md, docs/PROJECT-CONTEXT.md, docs/CHANGELOG.md

**Notes / gotchas**
- No migration. The existing `profiles.is_admin` flag is still the source of
  truth; server actions use the service-role client only for this allow-listed
  promotion.
- Phone mode has no SMS verification by design, so anyone who can sign in with
  this number can become admin.

## 2026-06-18 — Phone number boxes stay on one line
**Plan item:** Auth enhancement refinement (owner request)   **Status:** done

**What changed**
- Changed the national-number boxes from chunked wrapping groups to one
  responsive grid row.
- Kept the locked country key on the same line while letting the number boxes
  divide the remaining width evenly on mobile and desktop.

**Why**
- Owner wanted the number boxes in a straight line without breaking the phone UI.

**Files touched**
- src/app/[locale]/(auth)/login/phone-number-input.tsx
- docs/BUILD-PLAN.md, docs/PROJECT-CONTEXT.md, docs/CHANGELOG.md

**Notes / gotchas**
- No backend, i18n, or migration change.

## 2026-06-18 — Country picker with locked phone key
**Plan item:** Auth enhancement refinement (owner request)   **Status:** done

**What changed**
- Replaced editable country-key digit boxes with a country picker. The picker
  opens a searchable list; Sudan and Saudi Arabia appear first, followed by Gulf
  and Middle East countries before common international countries.
- Selecting a country auto-populates a locked `+<dial key>` display and resets
  the national-number boxes for that country's configured length.
- The hidden `name="phone"` field still submits the combined dial key +
  national-number digits to the unchanged `signInWithPhone` server action.
- Added localized picker/search/locked-key labels.

**Why**
- Owner wants members to select the country instead of typing the country key, so
  the key cannot be mistyped and the rest-of-number boxes match the selected
  country.

**Files touched**
- src/lib/phone/dialing-codes.ts
- src/app/[locale]/(auth)/login/phone-number-input.tsx
- messages/en.json, messages/ar.json
- docs/BUILD-PLAN.md, docs/PROJECT-CONTEXT.md, docs/CHANGELOG.md

**Notes / gotchas**
- Rev 18's fixed "country key + 9 digits" UI is superseded by this picker:
  Saudi Arabia still has 9 national boxes, while countries like Kuwait/Qatar use
  8 and Egypt/Iraq/Turkey use 10.
- No migration and no backend change.

## 2026-06-17 — Phone input limited to country key + 9 digits
**Plan item:** Auth enhancement refinement (owner request)   **Status:** done

**What changed**
- Reduced the national-number portion of the segmented phone input from 11 boxes
  to exactly 9 boxes, shown as three groups of three.
- Changed the form readiness rule: Continue is enabled only when there is a
  nonempty country key and all 9 national-number boxes are filled.
- The hidden `name="phone"` field and `signInWithPhone` server action remain
  unchanged.

**Why**
- Owner clarified the intended phone shape should be just a country key plus 9
  numbers.

**Files touched**
- src/app/[locale]/(auth)/login/phone-number-input.tsx
- src/app/[locale]/(auth)/login/phone-login-form.tsx
- docs/BUILD-PLAN.md, docs/PROJECT-CONTEXT.md, docs/CHANGELOG.md

**Notes / gotchas**
- No migration and no backend change.

## 2026-06-17 — Segmented phone-number sign-in UI
**Plan item:** Auth enhancement (owner request)   **Status:** done (build + lint clean)

**What changed**
- Replaced the phone login's single visible tel input with a segmented
  country-code + national-number input. It pre-fills +966, focuses the first
  national-number box on load, auto-advances while typing, supports arrow keys,
  backspace, and paste distribution, and keeps the number reading LTR in both
  locales.
- Added a curated dialing-code lookup with longest-prefix matching and generated
  flag emoji. Known codes animate in a localized flag/name above the boxes.
- The server contract stays unchanged: the visible boxes feed one hidden
  `name="phone"` field, and `signInWithPhone` still normalizes that combined
  digit string.
- Added English and Arabic labels for the grouped controls, per-box aria labels,
  and the curated country names.

**Why**
- Phone mode is meant to be fast and friendly for a private mobile-first family
  app. The segmented UI makes the international number explicit while preserving
  the synthetic Supabase account mapping and existing RLS behavior.

**Files touched**
- src/app/[locale]/(auth)/login/phone-number-input.tsx (new)
- src/lib/phone/dialing-codes.ts (new)
- src/app/[locale]/(auth)/login/phone-login-form.tsx
- messages/en.json, messages/ar.json
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- Behavior change: submitted phone identities now always include an explicit
  country code. A bare local number from the old single-input UI would map to a
  different synthetic account than the same number submitted as `966...`; this is
  acceptable because the app has no established production users yet.
- Flag emoji render as flags on iOS/Android, the target devices. Windows desktop
  typically shows regional-indicator letter pairs instead of flag glyphs.
- No migration and no `phone-actions.ts` change.
- Verification: `npm run lint`, message JSON parse, `npm run build`, and a dev
  route smoke for `/ar/login` + `/en/login` pass.

## 2026-06-17 — Phone-number sign-in mode (switchable)
**Plan item:** Auth enhancement (owner request)   **Status:** done

**What changed**
- Added an `AUTH_MODE` switch (`src/lib/auth/mode.ts`, read from
  `NEXT_PUBLIC_AUTH_MODE`, default `"phone"`). The login page renders the new
  phone form in phone mode and the original email-OTP form when set to `"otp"`.
- New passwordless phone sign-in: `phone-login-form.tsx` (one phone field) +
  `phone-actions.ts` server action `signInWithPhone`. New numbers go to
  onboarding (name + language); known numbers go straight to fixtures —
  mirroring the OTP flow.
- Added `auth.phone*` strings + `errors.invalidPhone` to `messages/en.json` and
  `messages/ar.json`.
- Documented `NEXT_PUBLIC_AUTH_MODE` and `PHONE_AUTH_SECRET` in `.env.example`.

**Why**
- The owner wants frictionless login for a small trusted friend group: typing a
  phone number is the entire login (no SMS, no verification). The original OTP
  code is kept intact so it can be reused as-is in another project by flipping
  the flag.

**How the fake phone auth still respects RLS**
- All RLS keys off `auth.uid()`, so a real session is still required. A phone
  number maps to a synthetic Supabase account: email `<digits>@phone.local`,
  password = HMAC(digits, `PHONE_AUTH_SECRET`) derived server-side only. First
  sign-in creates the user via the service-role admin client with
  `email_confirm: true` (no confirmation email needed), then signs in with the
  cookie-bound server client. The browser only ever sends the phone number.

**Files touched**
- src/lib/auth/mode.ts (new)
- src/app/[locale]/(auth)/login/phone-actions.ts (new)
- src/app/[locale]/(auth)/login/phone-login-form.tsx (new)
- src/app/[locale]/(auth)/login/page.tsx
- messages/en.json, messages/ar.json
- .env.example

**Notes / gotchas**
- This is intentionally insecure: anyone who knows a number can sign in as it.
  Acceptable for the private family group; do **not** reuse phone mode for
  anything needing real auth — use `otp` mode there.
- No DB migration. Synthetic users live in `auth.users` with `@phone.local`
  emails; their `profiles` row is still created in onboarding as before.
- Set `PHONE_AUTH_SECRET` in production (it has a dev fallback). Changing it
  later would orphan existing phone accounts (passwords no longer match).
- `npm run build` passes.

## 2026-06-17 — Fixtures UX pass: live matches, next-batch list, clearer back + save
**Plan item:** 5.1 UX polish (follow-up)   **Status:** done (build + lint clean)

**What changed**
- **Back control:** new reusable `BackLink` (outlined button + a direction-aware
  arrow that flips for RTL) replaces the faint muted-text back links on the
  match-detail and member-results pages.
- **Autosave indicator:** the prediction form's small status line is now an
  animated status *pill* — a spinner while saving and a green check that pops in
  (`animate-in zoom-in`) on save, re-triggered per save via a `savedTick` key.
  Still inline `role="status"` (no per-change toast, per §8).
- **Login navigation:** after a correct OTP, the form now does a full-document
  navigation (`window.location.assign`) to `/fixtures` (or `/onboarding`) instead
  of a soft `router.replace` + `router.refresh`.
- **In-progress matches:** Fixtures now treat "finished" as *has a final score /
  status finished*. A match that has kicked off but isn't finished is **in
  progress** — it stays in the **Upcoming** tab with a pulsing "live" badge
  (`LiveBadge`) instead of being dumped into Finished. Badge also shows on the
  detail page header.
- **Next batch only:** the Upcoming tab shows everything in progress plus only the
  not-yet-started matches within 24h of the earliest upcoming one (the next
  "match-day" cluster), not the whole future schedule.
- i18n: added `fixtures.inProgress` (ar/en); shortened `predict.saved` (the check
  icon now carries the ✓).

**Why**
- Owner feedback: the back link was easy to miss; the tiny "saved" text wasn't a
  satisfying confirmation; login didn't switch to the app until a manual reload;
  locked-but-unfinished games looked "finished"; and the Upcoming list was too
  long. A soft client push can race the `verifyOtp` cookie write, so the server
  RSC render still saw no session — a hard navigation guarantees the freshly set
  auth cookies are sent.

**Files touched**
- src/components/back-link.tsx (new)
- src/components/live-badge.tsx (new)
- src/app/[locale]/(auth)/login/login-form.tsx
- src/app/[locale]/(app)/fixtures/page.tsx
- src/app/[locale]/(app)/fixtures/[id]/page.tsx
- src/app/[locale]/(app)/fixtures/[id]/predict-form.tsx
- src/app/[locale]/(app)/leaderboard/[userId]/page.tsx
- messages/ar.json, messages/en.json

**Notes / gotchas**
- "Finished" = `status === "finished" || (home_score != null && away_score != null)`.
  In this app scores are only written when a match finishes, so score-presence is
  a safe finished signal; the explicit status is also honored.
- Next-batch window is a rolling 24h anchored on the earliest *not-started* match
  (matches are pre-sorted by kickoff asc), not a calendar day. Far-future matches
  simply aren't listed until they enter the window — by design.
- `LiveBadge`/`BackLink` are pure markup (server-component safe). The live badge
  uses red (`bg-red-500`/ping) as the universal "live now" cue.

---

## 2026-06-17 — Fix false error on login after OTP verify
**Plan item:** auth bugfix   **Status:** done

**What changed**
- Scoped the post-`verifyOtp` profile lookup in the login form to the signed-in
  user (`.eq("id", userId)`) instead of selecting from `profiles` unfiltered.

**Why**
- The `profiles` SELECT policy is `using (true)` (every authenticated user can
  read all profiles for the leaderboard). The unfiltered `.maybeSingle()`
  therefore returned every profile row and errored ("multiple rows returned")
  once more than one family member had registered. That set the "generic" error
  even though `verifyOtp` had already succeeded and persisted the session — so
  the user saw an error on entering a correct code but was logged in after a
  reload (middleware picked up the valid session).

**Files touched**
- src/app/[locale]/(auth)/login/login-form.tsx

**Notes / gotchas**
- No migration/env change. `verifyData.user.id` from `verifyOtp` is used as the
  filter so we don't need a second `getUser()` round-trip.

---

## 2026-06-17 - Match-aware result sync schedule
**Plan item:** 5.2 scheduler refinement   **Status:** done (repo artifact updated; production secrets still owner-bound)

**What changed**
- Replaced the steady 29/day GitHub Actions result-sync cadence with a match-aware
  WC2026 schedule generated from the openfootball feed.
- The workflow now calls `POST /api/sync` twice per fixture: kickoff +55 minutes
  for a half-time check, then a post-match check at kickoff +125 minutes for group
  matches or +170 minutes for knockouts so extra time and penalties can finish.
- Added a 2026 year guard so the date-specific cron entries do not keep calling
  the endpoint annually after the tournament.
- Updated README, build plan, and project context to document the new cadence.

**Why**
- Two match-timed pulls are enough for this app's current data model and use far
  fewer calls than constant polling. The current schedule peaks at 12 calls/day,
  comfortably under the endpoint's 30/day cap.

**Files touched**
- .github/workflows/sync.yml
- README.md
- docs/BUILD-PLAN.md
- docs/PROJECT-CONTEXT.md
- docs/CHANGELOG.md

**Notes / gotchas**
- The openfootball feed has an `ht` field, but the app intentionally writes only
  `ft` full-time scores today. The half-time call is a harmless freshness check;
  live/half-time score display would need separate storage/UI so it does not trip
  the final-score trigger.
- GitHub scheduled workflows can drift or be dropped under load, so cron-job.org
  remains the punctual fallback if exact match timing matters.

## 2026-06-17 - Phase 5.2 deploy prep and sync scheduler
**Plan item:** 5.2 repo-side deploy prep + 2.6 Step 5   **Status:** repo artifact done; owner production activation pending

**What changed**
- Added `.github/workflows/sync.yml`, a scheduled + manual GitHub Actions workflow
  that posts to the production `POST /api/sync` endpoint with
  `Authorization: Bearer $CRON_SECRET`.
- Encoded 29 explicit UTC runs/day (roughly every 50 minutes) instead of the
  proposed `*/50 * * * *`; that cron form would run 48 times/day and exceed the
  endpoint's 30/day cap.
- Updated the build plan and project context for deploy prep, clearing stale live
  DB/admin/sync owner items and documenting the remaining dashboard-bound work.

**Why**
- On Vercel Hobby, Vercel Cron's once/day limit is too coarse for result pulls.
  GitHub Actions gives a version-controlled external cron while keeping
  cron-job.org documented as the more punctual fallback if schedule drift matters.

**Files touched**
- .github/workflows/sync.yml
- docs/BUILD-PLAN.md
- docs/PROJECT-CONTEXT.md
- docs/CHANGELOG.md

**Notes / gotchas**
- Owner still needs to create the Vercel project, set Production env vars, add the
  `https://<app>.vercel.app` Site URL and `https://<app>.vercel.app/**` redirect
  wildcard in Supabase Auth, then add GitHub Actions secrets `SYNC_URL` and
  `CRON_SECRET` with the exact same secret value used in Vercel.
- Trigger **Actions → Sync results → Run workflow** once after secrets are set;
  expect a 200 response and a new `sync_runs` row in the admin Sync log.
- Verification run before the workflow/docs edits: `npm run build` and
  `npm run lint` both passed.

## 2026-06-17 - Phase 5.1 UX polish
**Plan item:** 5.1 Step 1, Step 2   **Status:** done (build + lint + RTL guard clean)

**What changed**
- Added Sonner toast infrastructure with a locale-layout `Toaster` mounted
  `top-center`, plus a shared `ToastFlash` reader for redirect success params.
- Migrated profile/admin team/fixture/result success confirmations to toasts;
  removed the old profile inline `?saved=1` box.
- Added direct login "code sent" and admin sync result toasts, with sync actions
  returning `{ ok, count }` state and revalidating the sync log.
- Added route-level `loading.tsx` skeletons for Fixtures, fixture detail,
  Leaderboard, member breakdown, Profile, and the admin teams/fixtures/results/sync
  screens.
- Swapped remaining admin empty-list paragraphs to the shared `EmptyState`.

**Why**
- Discrete actions should confirm completion without occupying permanent page
  space, while contextual validation errors remain next to the field that needs
  attention. Prediction autosave stays inline to avoid toast noise on every score
  adjustment.

**Files touched**
- package.json, package-lock.json
- src/components/ui/sonner.tsx
- src/components/toast-flash.tsx
- src/app/[locale]/layout.tsx
- src/app/[locale]/(auth)/login/login-form.tsx
- src/app/[locale]/(app)/profile/{actions.ts,page.tsx,loading.tsx}
- src/app/[locale]/(app)/fixtures/loading.tsx
- src/app/[locale]/(app)/fixtures/[id]/loading.tsx
- src/app/[locale]/(app)/leaderboard/loading.tsx
- src/app/[locale]/(app)/leaderboard/[userId]/loading.tsx
- src/app/[locale]/(app)/admin/{teams,fixtures,results,sync}/*
- messages/ar.json, messages/en.json
- docs/BUILD-PLAN.md, docs/PROJECT-CONTEXT.md, docs/CHANGELOG.md

**Notes / gotchas**
- `Toaster` is `top-center` specifically to avoid the fixed mobile bottom nav.
- Success flash params are one-shot: `ToastFlash` fires the toast, strips
  `toast`/`count`/`email`, and preserves any unrelated query params.
- Verification run: `npm run build`, `npm run lint`, and the RTL physical-property
  guard all pass.

## 2026-06-17 — Phase 4 leaderboard and results
**Plan item:** 4.1 Step 3, 4.2, 4.3   **Status:** code done (build + lint + RTL guard clean); live DB apply / SQL verification pending

**What changed**
- Added `0008_leaderboard.sql` with `public.get_leaderboard()`, a
  `SECURITY DEFINER` aggregate-only RPC returning total points, prediction counts,
  per-tier counts, and shared ranks across all profiles.
- Added `supabase/tests/0006_scoring_examples.sql`, a rollback-wrapped check for
  the §5 examples against the real `score_match()` trigger path.
- Added `src/lib/leaderboard.ts`, the shared `ResultsBreakdown` component, the
  Board / My-results Leaderboard tabs, tap-through member result pages, and the
  compact Profile leaderboard card.
- Added the Arabic / English `leaderboard` message namespace and updated the plan
  / context docs for Phase 4.

**Why**
- The board needs totals across all users, but individual predictions must still
  be filtered by RLS. The RPC returns aggregates only; result breakdowns keep using
  normal RLS-bound `predictions` reads.

**Files touched**
- supabase/migrations/0008_leaderboard.sql
- supabase/tests/0006_scoring_examples.sql
- src/lib/leaderboard.ts
- src/components/results-breakdown.tsx
- src/app/[locale]/(app)/leaderboard/page.tsx
- src/app/[locale]/(app)/leaderboard/[userId]/page.tsx
- src/app/[locale]/(app)/profile/page.tsx
- messages/ar.json, messages/en.json
- docs/BUILD-PLAN.md, docs/PROJECT-CONTEXT.md, docs/CHANGELOG.md

**Notes / gotchas**
- **Owner:** apply `0008_leaderboard.sql` after `0006`/`0007`, then run
  `supabase/tests/0006_scoring_examples.sql` in the SQL editor; it should finish
  with no exception and roll back its temporary rows.
- The board intentionally lists all profiles, including zero-point members.
- Tapping another member's row does not add a UI privacy gate; hidden picks stay
  hidden because the database RLS policy filters the breakdown query.

## 2026-06-16 — Clearer prediction saved confirmation
**Plan item:** 3.2 polish   **Status:** done

**What changed**
- Updated the prediction autosave success message in Arabic and English to say the
  prediction was saved and the score is recorded.

**Why**
- The old "Saved ✓" status was too generic; members should know their prediction
  specifically was recorded.

**Files touched**
- messages/ar.json, messages/en.json

**Notes / gotchas**
- Build and lint pass. Existing unrelated message/admin worktree changes remain
  uncommitted.

## 2026-06-16 — Phase 3 member predictions loop
**Plan item:** 3.1, 3.2, 3.3   **Status:** code done (build + lint + RTL guard clean); live DB end-to-end pending

**What changed**
- Added `src/lib/predictions.ts` for RLS-bound member prediction reads and
  match-level reveal reads joined to profile names.
- Replaced the member Fixtures placeholder with Upcoming / Finished tabs, date
  groups, browser-local kickoff rendering, and row CTAs for Predict / Edit / View.
- Added `/fixtures/[id]`: match detail, debounced autosaving +/- score steppers,
  locked/TBD read-only states, and a post-kickoff reveal list that displays only
  the predictions returned by RLS.
- Added the prediction save server action using the authenticated Supabase client
  only; RLS rejection maps to a typed locked state.
- Added Arabic + English `fixtures` / `predict` message namespaces.

**Why**
- Phase 3 is the core member loop: see fixtures, predict before kickoff, edit until
  kickoff, and see the family reveal once the database privacy gate opens.

**Files touched**
- src/lib/predictions.ts
- src/components/local-kickoff.tsx
- src/app/[locale]/(app)/fixtures/page.tsx
- src/app/[locale]/(app)/fixtures/[id]/{actions.ts,page.tsx,predict-form.tsx}
- messages/ar.json, messages/en.json
- docs/BUILD-PLAN.md, docs/PROJECT-CONTEXT.md, docs/CHANGELOG.md

**Notes / gotchas**
- Autosave starts only after the first stepper interaction, so opening a blank
  match detail does not write a 0-0 prediction.
- The form tracks a prediction saved during the current session, so if kickoff
  passes after a first save without a reload, the saved score remains visible.
- Device-local kickoff formatting is client-rendered (`LocalKickoff`); server-side
  UTC formatting remains admin-only.
- Reveal privacy relies on `0003_core_rls.sql`; the UI renders RLS-filtered rows and
  is not the gate.
- Full predict→reveal verification still needs the owner live steps: apply
  `0002`–`0007`, run the admin grant, set `CRON_SECRET`, run Full sync, then test
  with two accounts.

## 2026-06-14 — 2.6 sync provider swapped: API-Football → openfootball worldcup.json
**Plan item:** 2.6   **Status:** code done (build + lint + tsc clean); owner live-apply pending

**What changed**
- Replaced the sync data source. New feed client `src/lib/sync/openfootball.ts`
  fetches `openfootball/worldcup.json` (override via `WORLDCUP_FEED_URL`).
- Rewrote `src/lib/sync/world-cup.ts` against the feed; **deleted**
  `src/lib/sync/api-football.ts`. Public function names + return shapes are
  unchanged, so `/api/sync`, the Sync admin actions, and the UI work untouched.
- The adapter now: seeds **48 teams** keyed on FIFA `code` (English name → code map,
  Arabic+flag carried over); converts the feed's local-offset kickoff
  (`"13:00 UTC-6"`) → **UTC**; keys upserts on `api_fixture_id` = knockout `num`
  (73–104) or a stable FNV-1a hash of `group + sorted(team pair)` for the 72 group
  matches (which carry no id); infers `status` from full-time presence; writes scores
  only when finished (so `0006` scores finals only); labels unresolved knockout slots
  in **Arabic** (`home/away_label`, e.g. "وصيف المجموعة B", "الفائز من المباراة 74").
- Env: dropped `API_FOOTBALL_KEY` / `WORLDCUP_LEAGUE_ID` / `WORLDCUP_SEASON`; added
  optional `WORLDCUP_FEED_URL`. Updated `.env.example` + `PROJECT-CONTEXT` + `BUILD-PLAN`.

**Why**
- A paid sports API's free tier excludes **season 2026**, so the API-Football sync
  couldn't pull real WC2026 data — the original plan didn't cover this. openfootball
  is free, key-less, covers all 104 matches today, and updates scores live.

**Files touched**
- src/lib/sync/openfootball.ts (new), src/lib/sync/world-cup.ts (rewritten),
  src/lib/sync/api-football.ts (deleted)
- .env.example, docs/PROJECT-CONTEXT.md, docs/BUILD-PLAN.md

**Notes / gotchas**
- No schema change: reuses the existing `api_fixture_id` column as the stable external
  key; `api_team_id` is now **unused** (teams upsert on `code`). 0007 still applies as-is.
- The feed has **no "live" status** — an in-progress match reads `scheduled` until its
  full-time score posts. Harmless: the privacy/close gate keys on `kickoff_at`, not status.
- Validated against the live feed: 104 matches, **0 external-id collisions**, correct
  stage split (72/16/8/4/2/1/1), UTC conversion (13:00 UTC-6 → 19:00Z), 7 already finished.
- Owner: run **Full sync** from the admin Sync tab (expect 48 teams / 104 matches).

---

## 2026-06-14 — 2.6 API-Football sync (`0007`) + admin Sync tab
**Plan item:** 2.6   **Status:** code done; owner live-apply + paid plan pending

**Decision:** reverses §4.2 ("no external API in v1") per owner request — teams,
fixtures, and results now sync from **API-Football** (league 1) instead of a hand
seed. Supersedes the deferred 2.3 manual seed (`0004`/`0005` not written).

**What changed**
- `0007_api_sync.sql`: `teams.api_team_id` + `matches.api_fixture_id` (unique upsert
  keys) and a `sync_runs` log (admin-readable; backs the ≤30/day cap).
- `src/lib/sync/api-football.ts`: typed client (key + league/season from env).
- `src/lib/sync/world-cup.ts`: `syncSchedule()` (`/teams` + `/standings` groups +
  `/fixtures`) and `syncResults()` (1 request). Maps UTC `fixture.date`→`kickoff_at`,
  `goals`→scores (**excludes penalties** per §4.4), `score.penalty`→shootout winner,
  `round`→stage, `/standings`→`group_letter`; static `TEAM_META` adds Arabic names +
  flag emojis. Service-role writes; final scores trip the `0006` trigger → auto-score.
- `POST /api/sync`: Bearer (`CRON_SECRET`) + per-UTC-day cap (30); logs `sync_runs`.
- Admin **Sync** tab (`/admin/sync`): Full sync / Sync results + recent-runs log;
  added to admin sub-nav + i18n (ar/en).
- Env: `.env.example` + README (`API_FOOTBALL_KEY`, `CRON_SECRET`,
  `WORLDCUP_LEAGUE_ID`, `WORLDCUP_SEASON`); `supabase/README.md` 0007 row.

**Why**
- Authoritative, auto-updating data (UTC times, venues, results) without hand-entry;
  reuses the existing scoring trigger so no scoring-logic changes.

**Verified against the live API**
- League 1 = World Cup; season 2026 exists with full coverage but is **paid-only** on
  Free ("try from 2022 to 2024"). Validated the fixtures/teams/standings shapes and
  the `goals` vs `score.penalty` mapping against 2022 (incl. the AET+penalties final).
  `npm run build` + `npm run lint` + RTL grep guard pass.

**Notes / gotchas**
- **Owner:** apply `0007`; set `API_FOOTBALL_KEY`/`CRON_SECRET`; **dry-run on
  `WORLDCUP_SEASON=2022`** (Free) to prove the pipeline; then **subscribe** + set 2026.
- `round` ("Group Stage - 1") lacks the group letter → derived from `/standings`.
- Scores written only for finished matches (FT/AET/PEN), so the trigger scores finals
  only — never live/partial scores.
- The API key was shared in chat — keep it in `.env.local` only; consider rotating.
- Cron not wired yet (Phase 5); the manual Sync tab works now. Run a **Full sync**
  once before results syncs (it resolves the team mapping).

---

## 2026-06-13 — Perf: dedupe per-navigation auth/profile reads
**Plan item:** n/a (performance fix)   **Status:** done

**What changed**
- Wrapped `getCurrentUser` and `getProfile` in `src/lib/profile.ts` with React
  `cache()`, and `getProfile` now reuses the cached `getCurrentUser()` instead of
  calling `supabase.auth.getUser()` itself.

**Why**
- Each navigation re-read auth/profile several times: the `(app)` layout, the
  `admin` layout, and pages all call these, so `/[locale]/profile` fired ~4
  `getUser()` network calls + 2 `profiles` queries (admin pages double-fetched the
  profile). `cache()` is request-scoped, so within one render they collapse to a
  single `getUser()` + single `profiles` query — no cross-request/user leakage.

**Files touched**
- src/lib/profile.ts
- docs/CHANGELOG.md

**Notes / gotchas**
- **Deviation from the approved plan:** kept `profile/page.tsx` calling both
  `getCurrentUser()` and `getProfile()` rather than dropping the former. Collapsing
  to `getProfile()` alone would lose the "no user → /login" vs "no profile →
  /onboarding" distinction (`getProfile()` returns null for both). `cache()` already
  makes the pair a single round-trip, so there's no perf cost to keeping them.
- Middleware ([middleware.ts](../src/lib/supabase/middleware.ts)) `getUser()` is
  unchanged — one authoritative validated check + cookie refresh per nav. `cache()`
  can't span the middleware↔render boundary, so that call stays separate by design.
- This does **not** cut dev-mode compile time (the likely bulk of perceived
  slowness). Measure against `npm run build && npm start`, not `npm run dev`.
- Deferred: middleware `getClaims()` local JWT verification (needs asymmetric
  signing keys + accepts a revoked token valid until expiry) — revisit only if
  still slow in prod.
- Build + lint pass.

---

## 2026-06-13 — 2.3 deferred (UI-first); 2.4 + 2.5 admin UI + scoring
**Plan item:** 2.3 (deferred), 2.4 (done), 2.5 (done in code)   **Status:** see below

**Decision: seed deferred (2.3 ⊘).** Web sources for the 2026 schedule/results were
inconsistent (e.g. a Mexico-based Group A match placed in Atlanta; results varied
between fetches). Since this data drives scoring and the kickoff lock, the owner
chose **UI-first**: populate via the admin UI (or a one-off load of owner-provided
official data) instead of a web-scraped seed. `0004`/`0005` are not written.

**What changed (2.4 — admin fixtures & teams):**
- `/admin` gated two ways: added `/admin` to the middleware app-route list, and an
  `admin/layout.tsx` that redirects non-admins (`!profile.is_admin`) to `/fixtures`.
- Header "Admin" link (Shield icon) shown only to admins; admin sub-nav
  (Fixtures / Results / Teams).
- Data layer: `src/lib/teams.ts`, `src/lib/matches.ts` (server-only fetch helpers),
  `src/lib/match-types.ts` (client-safe constants/types), `src/lib/match-format.ts`
  (shared `sideName`/`formatKickoffUtc`).
- **Teams CRUD** and **Fixtures CRUD** (list + add + edit) with shared client forms
  (`useActionState`), server actions, and a full `admin` i18n namespace (ar + en).

**What changed (2.5 — results & scoring):**
- `0006_scoring.sql`: `public.score_match()` (SECURITY DEFINER, reads `app_settings`),
  a BEFORE trigger deriving `status` from scores, and an AFTER trigger rescoring the
  match's predictions. Signed-GD logic per §5; idempotent; clearing scores resets
  points to null + status to scheduled.
- Results tab: per-match score entry (+ optional shootout winner, display-only) and
  a clear-result action; the DB triggers do the scoring.

**Why**
- With the seed deferred, the admin UI must create teams + fixtures (not just edit),
  so teams CRUD was added to 2.4. Scoring lives with results entry (the action that
  drives it); Phase 4.1 becomes the worked-example check.

**Files touched**
- supabase/migrations/0006_scoring.sql
- src/lib/{teams,matches,match-types,match-format}.ts
- src/lib/supabase/middleware.ts, src/app/[locale]/(app)/layout.tsx
- src/app/[locale]/(app)/admin/** (layout, admin-nav, page, teams/*, fixtures/*, results/*)
- messages/ar.json, messages/en.json
- docs/BUILD-PLAN.md, docs/PROJECT-CONTEXT.md, docs/CHANGELOG.md

**Notes / gotchas**
- **Owner:** apply `0006` after `0002`/`0003`; verify §5 examples (actual 2-1:
  2-1→7, 3-2→4, 1-0→4, 3-0→2, 1-2→0). Admin writes need the `is_admin` grant first.
- **`server-only` split:** client components must not value-import a `server-only`
  module. `MATCH_STAGES`/types live in `match-types.ts`; `matches.ts` re-exports
  them for server code. (`import type` is erased, so `Team` from `teams.ts` is fine.)
- **Button is Base UI, not Radix** — no `asChild`. Style link-buttons with
  `buttonVariants()` on a next-intl `<Link>`.
- Kickoff is entered/displayed in **UTC** in the admin (field labelled UTC) — a v1
  simplification; the admin converts venue-local → UTC themselves.
- Build, lint, and the logical-property RTL grep guard all pass.

---

## 2026-06-13 — 2.2 RLS policies + is_admin() (`0003_core_rls.sql`)
**Plan item:** 2.2   **Status:** code done; owner live-apply + privacy verify pending

**What changed**
- Added `0003_core_rls.sql`:
  - `public.is_admin()` — SECURITY DEFINER, `set search_path = public`, `stable`;
    reads `profiles` without RLS recursion; `execute` to `authenticated`.
  - `predictions` policies — SELECT own-or-after-kickoff (the core privacy gate);
    INSERT/UPDATE own-row & pre-kickoff only; no DELETE.
  - `predictions` **column grants** — members may write only
    `home_score`/`away_score` (+ `user_id`/`match_id` on insert), so
    `points_awarded` can never be self-set (mirrors `0001`'s `is_admin` trick).
  - `teams`/`matches`/`app_settings` — read for all authenticated; admin `for all`
    write policy gated by `is_admin()`.

**Why**
- Privacy and write rules belong in the DB, not the UI (§7). The SECURITY DEFINER
  helper is the documented way to gate admin writes without recursing on
  `profiles`' own RLS.

**Files touched**
- supabase/migrations/0003_core_rls.sql
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- **Owner:** apply `0003` after `0002`, then verify with two accounts — B can't
  read A's pre-kickoff pick (can after kickoff); a member's
  `update predictions set points_awarded = …` is denied; non-admin writes to
  `matches` are denied, admin's are allowed.
- Admin writes need the owner's `profiles.is_admin = true` (the README grant) —
  until that's run, even the owner can't write teams/matches.

---

## 2026-06-13 — 2.1 core schema migration (`0002_core_schema.sql`)
**Plan item:** 2.1   **Status:** code done; owner live-apply + admin grant pending

**What changed**
- Added `0002_core_schema.sql`: `teams`, `matches`, `predictions`, `app_settings`
  with constraints (`UNIQUE(user_id, match_id)`, non-negative score + stage/status
  `CHECK`s), indexes (`predictions(match_id)`, `matches(kickoff_at)`,
  `matches(stage)`), a shared `set_updated_at()` trigger, and the `app_settings`
  singleton seeded 7 / 4 / 2.
- **Enabled RLS deny-all on all four tables in `0002`** (refinement over the plan,
  which deferred enabling to `0003`) so the tables are never exposed via the anon
  key between migrations. Policies + grants still land in `0003`.
- Documented the migration order and the one-off admin-grant `UPDATE` in
  `supabase/README.md`.

**Why**
- The core data model must exist before RLS, seeds, and admin tooling. Enabling
  RLS immediately keeps privacy fail-closed if `0003` hasn't been applied yet.

**Files touched**
- supabase/migrations/0002_core_schema.sql
- supabase/README.md
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- **Owner:** apply `0002` in the SQL editor (after `0001`), then run the
  admin-grant `UPDATE` from `supabase/README.md` after first login. RLS is on but
  has no policies until `0003` → tables are deny-all to members until then.
- `app_settings` insert runs as the SQL-editor (owner) role, so RLS doesn't block
  the seed.
- No app code yet this step; lint/build unaffected (SQL + docs only).

---

## 2026-06-13 — Phase 2 plan locked: data model, RLS, seed, admin
**Plan item:** Phase 2 (planning)   **Status:** done (planning); execution next

**What changed**
- Locked four Phase 2 decisions via owner Q&A and recorded them in the docs:
  - Seed data is **web-fetched** from the official FIFA 2026 schedule and
    **owner-verified before commit**.
  - Already-kicked-off matches are seeded with **real final scores (display-only)**.
  - Owner admin via a **manual one-off SQL `UPDATE`** after first login.
  - Phase 1 confirmed **applied & verified** live (flipped 1.0 Step 4 and 1.1 to ☑;
    fixed the stale 0.1 marker).
- Refined the Phase 2 backlog with migration filenames (`0002`–`0006`), a member-write
  **column-grant** rule for `predictions.points_awarded`, the `is_admin()`
  SECURITY DEFINER helper, `matches.match_number`/stored `status`, and a
  `score_match()` + AFTER-UPDATE trigger for results-driven, idempotent scoring.

**Why**
- Close build-blocking unknowns before writing the core schema, and keep the plan
  small/verifiable with each migration verified against the now-live DB.

**Files touched**
- docs/PROJECT-CONTEXT.md (rev 7)
- docs/BUILD-PLAN.md (rev 7)
- docs/CHANGELOG.md

**Notes / gotchas**
- No app/SQL code yet — this is a planning execution.
- Next unblocked: **2.1** — write `0002_core_schema.sql`.
- The scoring function is built in **2.5** (results entry drives it); **4.1**
  becomes the worked-example unit check, not a second implementation.

---

## 2026-06-12 — Phase 1 final OTP error-mapping pass
**Plan item:** 1.1 Step 3   **Status:** done

**What changed**
- Kept invalid/expired code errors distinct from generic verification failures;
  rate limits remain their own localized state.

**Why**
- Network or server failures should not tell a member that a valid code is wrong.

**Files touched**
- src/app/[locale]/(auth)/login/login-form.tsx
- docs/CHANGELOG.md

**Notes / gotchas**
- Final lint and Turbopack build pass. Logical-property/navigation-import guards
  are clean; local smoke tests confirm ar/RTL, en/LTR, and locale-aware
  logged-out route redirects.

---

## 2026-06-12 — 1.3 session refresh and route protection
**Plan item:** 1.3   **Status:** done

**What changed**
- Composed the existing next-intl proxy response with a Supabase SSR client that
  refreshes request/response auth cookies.
- Added locale-aware login/app redirects while carrying refreshed cookies onto
  redirect responses.
- Added the app-layout profile-completeness gate, keeping the database lookup out
  of middleware.

**Why**
- App routes must require a validated Supabase user, while authenticated users
  without a profile must finish onboarding before using the app.

**Files touched**
- src/lib/supabase/middleware.ts
- src/proxy.ts, src/app/[locale]/(app)/layout.tsx
- docs/BUILD-PLAN.md, docs/PROJECT-CONTEXT.md, docs/CHANGELOG.md

**Notes / gotchas**
- Local unauthenticated smoke test passed: `/ar/fixtures` → `/ar/login`,
  `/en/leaderboard` → `/en/login`, and `/ar/onboarding` → `/ar/login`.
- Authenticated/no-profile and real-email checks require the hosted migration and
  owner dashboard email-template setup.
- Lint, production build, and logical-property grep pass.

---

## 2026-06-12 — 1.2 onboarding and profile management
**Plan item:** 1.2 (+ 1.3 Step 2)   **Status:** done

**What changed**
- Added server-side profile helpers for the current user and profile row.
- Added first-login onboarding with required full name and locale, inserting the
  RLS-bound profile row before redirecting to fixtures.
- Replaced the profile placeholder with name/locale editing, locale-aware
  redirect, saved confirmation, and sign-out.

**Why**
- A missing profile row is the explicit incomplete-onboarding state; profile
  writes stay within the member-editable grants from migration `0001`.

**Files touched**
- src/lib/profile.ts
- src/app/[locale]/(auth)/onboarding/*
- src/app/[locale]/(app)/profile/*
- messages/ar.json, messages/en.json, docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- next-intl's locale-aware `redirect` is typed as `void`, so server actions and
  components include unreachable fallback returns for TypeScript narrowing.
- Sign-out (1.3 Step 2) landed here because it belongs on the real profile page.
- Lint, production build, and logical-property grep pass.

---

## 2026-06-12 — 1.1 localized email OTP flow
**Plan item:** 1.1 Steps 1–3   **Status:** done; real email round-trip pending

**What changed**
- Added a centered `(auth)` layout with the language switcher and no app nav.
- Added the two-step login form: send email OTP, verify six-digit code, then
  route to onboarding or fixtures based on profile presence.
- Added localized inline errors, disabled/loading states, resend cooldown, and
  the shadcn Label primitive.

**Why**
- Open registration and returning-member login use the same Supabase email-code
  flow, while first-time users need to be directed into profile setup.

**Files touched**
- src/app/[locale]/(auth)/layout.tsx
- src/app/[locale]/(auth)/login/{page.tsx,login-form.tsx}
- src/components/ui/label.tsx, messages/ar.json, messages/en.json
- docs/BUILD-PLAN.md, docs/PROJECT-CONTEXT.md, docs/CHANGELOG.md

**Notes / gotchas**
- Supabase's Magic Link template must display `{{ .Token }}` before the real
  typed-code round-trip can pass.
- Lint, production build, and logical-property grep pass.

---

## 2026-06-12 — 1.0 profiles table + RLS migration
**Plan item:** 1.0   **Status:** done in code; owner SQL-editor apply pending

**What changed**
- Added `0001_profiles.sql` with the Phase 1 profile schema, RLS policies, and
  grants that exclude `is_admin` from member updates.
- Documented the versioned, paste-into-SQL-editor migration workflow.
- Pulled profiles out of Phase 2.1, recorded avatar deferral, and updated project
  security/context docs.

**Why**
- Onboarding and profile-complete routing need the profile table before the rest
  of the Phase 2 schema.

**Files touched**
- supabase/migrations/0001_profiles.sql, supabase/README.md
- README.md, docs/BUILD-PLAN.md, docs/PROJECT-CONTEXT.md, docs/CHANGELOG.md

**Notes / gotchas**
- Apply `0001_profiles.sql` once in the Supabase SQL editor and confirm RLS is on.
- The migration replaces table-wide member UPDATE with column grants; a
  column-only revoke would not block `is_admin` while table UPDATE remained.

---

## 2026-06-12 — 0.4 complete: Supabase live smoke test passed
**Plan item:** 0.4 (Step 1 + Step 4)   **Status:** done — **Phase 0 complete**

**What changed**
- Owner created the Supabase project; keys placed in `.env.local` (git-ignored).
- Ran the live smoke test: `GET /api/supabase-health` → `{ok:true, connected:true}`,
  confirming the server client reaches the project and authenticates.
- Recognized PostgREST's `PGRST205` (table-not-found in schema cache) as a
  "connected, no table yet" success alongside Postgres `42P01`.
- Removed the throwaway smoke-test route (`src/app/api/...`) per plan.

**Why**
- Closes item 0.4 Steps 1 & 4 and finishes Phase 0.

**Files touched**
- removed: src/app/api/supabase-health/route.ts
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- **Security:** the real keys were briefly pasted into the tracked `.env.example`;
  moved them to `.env.local` and restored `.env.example` placeholders **before any
  commit**, so no secret entered git history. `.env.example` must stay
  placeholder-only.
- A "table not found" error from the smoke check is the *expected* success signal
  pre-Phase-2 (no app tables exist yet).

---

## 2026-06-12 — 0.5 App shell: nav, placeholder routes, primitives
**Plan item:** 0.5   **Status:** done

**What changed**
- Added the `(app)` route group under `src/app/[locale]/` with a shared shell
  layout: sticky header (app name + desktop `MainNav` + `LanguageSwitcher`) and a
  mobile-only fixed `BottomNav`.
- Added placeholder tabs: `fixtures`, `leaderboard`, `profile` — each renders an
  `EmptyState` with its localized title.
- Nav config in `src/lib/nav.ts` (shared by both navs); active state via
  next-intl `usePathname` (locale-agnostic paths).
- Primitives: `src/components/empty-state.tsx` and `src/components/ui/skeleton.tsx`.
- `/[locale]` index now redirects to `/[locale]/fixtures` (app opens on Fixtures).
- Added `comingSoon` messages (ar/en).

**Why**
- Item 0.5: a navigable, responsive shell + reusable empty/loading primitives so
  later phases drop real content into known slots.

**Files touched**
- src/app/[locale]/(app)/layout.tsx
- src/app/[locale]/(app)/{fixtures,leaderboard,profile}/page.tsx
- src/app/[locale]/page.tsx (now a redirect)
- src/components/{bottom-nav,main-nav,empty-state}.tsx, src/components/ui/skeleton.tsx
- src/lib/nav.ts, messages/ar.json, messages/en.json

**Notes / gotchas**
- Responsive split: `BottomNav` is `md:hidden`, `MainNav` is `hidden md:flex`;
  `<main>` uses `pb-20 md:pb-6` to clear the fixed bottom nav on mobile.
- Verified via curl: `/ar` → 307 → `/ar/fixtures`; nav labels + empty states
  render correctly with `dir="rtl"` (ar) and `dir="ltr"` (en). Lint + logical-
  property grep guard clean.
- **Phase 0 is functionally complete** apart from 0.4's live Supabase smoke test
  (awaiting owner keys).

---

## 2026-06-12 — 0.4 Supabase wiring (clients + env; smoke test pending keys)
**Plan item:** 0.4   **Status:** in progress (blocked on owner-supplied keys)

**What changed**
- Installed `@supabase/supabase-js` + `@supabase/ssr`.
- Added clients in `src/lib/supabase/`:
  - `client.ts` — browser client (anon key, RLS-bound).
  - `server.ts` — server client with async `cookies()` (Next 16) for session
    persistence.
  - `admin.ts` — service-role client, guarded with `import "server-only"`.
- Added `.env.example` (URL, anon key, service-role key) and a `!.env.example`
  exception in `.gitignore` so the template is committed but real `.env.local`
  stays ignored.
- Documented env vars + setup in `README.md` (replaced the CNA boilerplate).
- Added a temporary smoke-test route `GET /api/supabase-health` that confirms
  PostgREST connectivity (treats `42P01` as success → connected, no table yet).

**Why**
- Item 0.4: stand up the Supabase access layer with the RLS-correct split
  (anon vs service-role) so later phases just import these clients.

**Files touched**
- package.json
- src/lib/supabase/{client,server,admin}.ts
- src/app/api/supabase-health/route.ts
- .env.example, .gitignore, README.md

**Notes / gotchas**
- **BLOCKED:** owner must create the Supabase project and supply
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`. Then: `cp .env.example .env.local`, fill, hit
  `/api/supabase-health` to verify, and **delete the smoke-test route**.
- `admin.ts` must never be imported from client code (`server-only` enforces it).
- Build verified clean without real keys (clients instantiate lazily).

---

## 2026-06-12 — 0.3 i18n + RTL with next-intl
**Plan item:** 0.3   **Status:** done

**What changed**
- Installed **next-intl v4**; wired the plugin in `next.config.ts`
  (`createNextIntlPlugin` → `src/i18n/request.ts`).
- Added `src/i18n/{routing,navigation,request}.ts`: locales `ar` (default, RTL) +
  `en` (LTR); locale-aware `Link`/`router`/`usePathname` helpers.
- Added `src/proxy.ts` (Next 16's renamed middleware) running next-intl's locale
  middleware; matcher skips api/_next/_vercel and files with extensions.
- Moved the app under **`src/app/[locale]/`**: `layout.tsx` sets
  `<html lang dir>` + Tajawal + `NextIntlClientProvider`, with
  `generateStaticParams` and localized `generateMetadata`; deleted the old
  `src/app/{layout,page}.tsx`.
- Added `messages/ar.json` + `messages/en.json` (`common`/`nav`/`language`).
- Added `src/components/language-switcher.tsx` (ar ⇄ en, preserves path).
- Sample page uses logical props only (`ps-`, `border-s`, `text-start`).

**Why**
- Item 0.3: Arabic-first localization with automatic RTL/LTR mirroring, enforced
  at the layout layer so every later screen inherits it.

**Files touched**
- next.config.ts
- src/i18n/routing.ts, src/i18n/navigation.ts, src/i18n/request.ts, src/proxy.ts
- src/app/[locale]/layout.tsx, src/app/[locale]/page.tsx
- src/components/language-switcher.tsx
- messages/ar.json, messages/en.json
- removed: src/app/layout.tsx, src/app/page.tsx

**Notes / gotchas**
- **Next 16** uses `src/proxy.ts`, not `middleware.ts`. The `[locale]/layout.tsx`
  is the effective root layout (no `src/app/layout.tsx`).
- `NextIntlClientProvider` is used without props — it inherits messages/locale
  from the request config (next-intl v4 behavior).
- Verified via curl: `/` → 307 → `/ar`; `/ar` = `dir="rtl"` (Arabic), `/en` =
  `dir="ltr"` (English); logical-property grep guard clean.
- `/[locale]` currently renders dynamically (ƒ); fine for Phase 0.

---

## 2026-06-12 — 0.2 App scaffold: Next.js + Tailwind + shadcn/ui + Tajawal
**Plan item:** 0.2 (+ 0.1 Step 5 sign-off)   **Status:** done

**What changed**
- Owner signed off on the docs (0.1 Step 5 ☑); began the build.
- Scaffolded the app with `create-next-app`: **Next 16.2.9, React 19, TypeScript,
  Tailwind v4, ESLint, App Router, `src/` dir, `@/*` alias.** Scaffolded into a
  temp dir and merged in to preserve `docs/`, `CLAUDE.md`, and `.git`.
- Initialized **shadcn/ui** with `--rtl` (base-nova style, neutral base, CSS
  variables); added **button, input, card**.
- Set a "sports app" theme: **green primary accent** (oklch ~0.58/0.7 hue 152) for
  light + dark, with matching ring/accent tokens.
- Wired **Tajawal** (`next/font/google`, arabic+latin) as `--font-sans`; root
  layout defaults to `lang="ar" dir="rtl"`.
- Replaced the boilerplate landing page with a minimal Arabic card/button sample.
- Pinned `turbopack.root` in `next.config.ts` to silence a workspace-root warning
  caused by a stray `yarn.lock` in the home directory.

**Why**
- Item 0.2: establish the running, styled shell every later phase builds on.
  Tajawal + RTL-default chosen per owner (Arabic-first app).

**Files touched**
- package.json, next.config.ts, components.json
- src/app/layout.tsx, src/app/globals.css, src/app/page.tsx
- src/components/ui/{button,input,card}.tsx, src/lib/utils.ts
- (generated) tsconfig.json, eslint.config.mjs, postcss.config.mjs, .gitignore
- CLAUDE.md (filled in Commands section)

**Notes / gotchas**
- **Tailwind v4** = CSS-first config; theme lives in `src/app/globals.css`
  (`@theme inline` + `:root`/`.dark` CSS vars). No `tailwind.config.js`.
- shadcn CLI here uses `-b radix|base` (component lib) and a separate `--rtl`
  flag — *not* `-b <color>`. Base color is set via `-d` default (neutral).
- `.gitignore` ignores `.env*`; remember to add `!.env.example` when 0.4 lands.
- Commands now live in CLAUDE.md: `npm run dev | build | lint`.

---

## 2026-06-12 — Requirements round 2: admin, full data seed, mid-tournament launch
**Plan item:** 0.1 (docs refinement)   **Status:** done (still pending sign-off)

**What changed**
- Captured four more decisions and updated `PROJECT-CONTEXT.md` (§4 items 5–8, §9,
  §10) and `BUILD-PLAN.md` (items 2.1, 2.3, 3.1, Current Position):
  - **Admin** = `ahmed.mohamed.xx420@gmail.com` (single owner; also competes).
  - **Seed data** = pre-load all 48 teams + the full 104-match official schedule;
    admin only enters results.
  - **Launch** = going live mid-tournament; matches already kicked off are
    results-only (kickoff rule auto-locks them — no extra schema needed).
  - **Bonus picks** = none in v1; per-match score predictions only.

**Why**
- Owner answered the round-2 clarifying questions to close build-blocking gaps in
  admin designation, data seeding, launch behavior, and v1 scope.

**Files touched**
- docs/PROJECT-CONTEXT.md
- docs/BUILD-PLAN.md
- docs/CHANGELOG.md

**Notes / gotchas**
- Seeding requires the real FIFA 2026 schedule (fixtures, kickoff times, venues).
  Pull and verify it at build time (Plan 2.3); store venue-local times as UTC.
- No new "results-only" flag: the existing `now() >= kickoff_at` rule already
  closes predictions on past matches.
- Admin grant needs the owner's profile to exist first (post-first-login step).

---

## 2026-06-12 — Project kickoff: requirements locked + support docs created
**Plan item:** 0.1 Steps 1–4   **Status:** done (pending owner sign-off, Step 5)

**What changed**
- Captured the four open product decisions via clarifying questions:
  - Scoring: **exact 7 / goal-diff 4 / winner 2 / miss 0** (precision-heavy).
  - Match data: **manual admin entry**, schema kept API-ready.
  - Registration: **open** (anyone with the link).
  - Knockouts: scored on **official full-time score incl. extra time**; shootout
    not scored.
- Created `docs/PROJECT-CONTEXT.md` (objective, scope, stack, decisions, scoring
  algorithm with worked examples, data model, RLS/privacy model, i18n/design,
  assumptions).
- Created `docs/BUILD-PLAN.md` (phases 0–5, item/step backlog, status markers,
  current-position pointer).
- Created `docs/CHANGELOG.md` (this file).
- Created `CLAUDE.md` to wire the docs into the build workflow.

**Why**
- The owner wants a documentation-first workflow: a context doc, an ordered
  backlog tracked per step, and a changelog — so the build stays clean and the AI
  always has fresh context. These four files are that backbone, created before any
  app code.

**Files touched**
- docs/PROJECT-CONTEXT.md
- docs/BUILD-PLAN.md
- docs/CHANGELOG.md
- CLAUDE.md

**Notes / gotchas**
- No application code yet. Next step is owner sign-off on the docs, then scaffold
  the Next.js app (Plan item 0.2).
- Scoring numbers will live in an `app_settings` row so they can be tuned without
  a redeploy — don't hard-code them.
- Prediction privacy must be enforced in **RLS**, not just the UI (see
  PROJECT-CONTEXT.md §7).
