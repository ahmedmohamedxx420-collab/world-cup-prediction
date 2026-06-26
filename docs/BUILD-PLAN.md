# Build Plan — FIFA World Cup Prediction

> **The ordered backlog and exactly where we are.** Build top-to-bottom; each item
> is small enough to finish, verify, and commit on its own. **After every coding
> execution, update the status markers below and the "Current Position" pointer,
> then append a matching entry to `[CHANGELOG.md](./CHANGELOG.md)`.**
>
> **Last updated:** 2026-06-21 (rev 39)

---

## Status legend

- ☐ **To do**
- ◐ **In progress**
- ☑ **Done** (built + verified)
- ⊘ **Blocked / skipped** (note why inline)

## Current Position

➡️ **Prizes vs honours redesigned by shape (rev 46).** On the top-3 cards prizes and
Hall-of-Fame honours were blending (both white icon+label pills). Now they differ by
**shape**: prizes are **big full-width labeled bars** (column stack, larger padding,
bigger icon/label, champion cash bar bumped further), while honours are **small round
icon-only medallions** (`2rem` circles, `size-4` icon, label moved to `sr-only`).
Scope: podium cards only — the Hall of Fame page is unchanged. Files:
`leaderboard/page.tsx`, `globals.css`. `npm run build` clean. See CHANGELOG (rev 46).

➡️ **Podium prizes made prominent + green (rev 45).** Reworked the top-3 `CardPrize`
so prizes dominate the card and read as *prizes*, not Hall-of-Fame badges. Added a
visible **"PRIZE" eyebrow** (lucide `Trophy`, reuses `prizes.label`) above the chips,
enlarged the chips vs the HoF badge pills, turned the **cash** chip into a bold solid
**green** tag (`#16a34a→#15803d`, white text) with a new pulsing green halo
(`wc-cash-glow`), and made the money effect much bigger & green — green `$` coins,
larger font, 5 particles (was 3), longer `wc-coin-rise` travel. Nitro/role keep purple
and inherit the larger sizing. Cash glow + coins guarded by `prefers-reduced-motion`.
Files: `leaderboard/page.tsx`, `globals.css`. `npm run build` clean.
See CHANGELOG 2026-06-26 (rev 45).

➡️ **Leaderboard prize badges (rev 44).** The top-3 podium cards now advertise the
Discord-tournament rewards under each player's name via a new `CardPrize` component
(`src/app/[locale]/(app)/leaderboard/page.tsx`): **1st** = a gold "50 SAR" cash chip
with floating `$` coin particles **+ Custom Role**; **2nd** = a purple, glowing
**Nitro** chip **+ Custom Role**; **3rd** = the **Nitro** chip. Prizes are hardcoded
by medal (`PODIUM_PRIZES`, display-only — like the scoring mirror, not DB-driven).
The Nitro icon is a lucide `Gem` stand-in (swap for real art later); "Custom Role" is
a Discord-style role pill (colored dot + label). Styling/keyframes (`.wc-prize*`,
`wc-coin-rise`, `wc-nitro-glow`) live in `globals.css`, RTL-safe and guarded by
`prefers-reduced-motion`. New `leaderboard.prizes.*` strings in both locales. A static
mirror was added to the design-system podium preview for an auth-free gallery view.
`npm run lint` + `npm run build` clean. See CHANGELOG 2026-06-26 (rev 44).

➡️ **"Sudanship" splash + brand wordmark (rev 43).** The app now has a brand
identity. The locale root (`/[locale]`) used to redirect straight to `/fixtures`
(→ login); it now renders a **splash hero**: the kicking-player artwork
(`public/sudanship-banner.png`) + a large "Sudanship" wordmark in the **Bebas
Neue** tall display font (uppercase, gold→lime gradient) + a tagline + a lime
**Start** button → `/fixtures`
(middleware still routes signed-in users in and everyone else to login). The same
lockup (`src/components/brand-wordmark.tsx`) replaces the old soccer-ball + app
name in the logged-in header, so it shows on every app page. Bebas Neue is loaded
via `next/font/google` as `--font-display`; wordmark styling lives in
`globals.css` (`.wc-wordmark` / `.wc-wordmark--on-dark`). Added `common.welcome`
to both locales. `npm run build` clean; `/ar` + `/en` splash prerender + smoke-test
200. See CHANGELOG 2026-06-23 (rev 43).

**Follow-up polish (2026-06-23):** the banner shipped as RGB with a baked-in
checkerboard (it showed a light box on the dark splash) — re-keyed to a true
transparent RGBA PNG via `scripts/make-banner-transparent.mjs` (original backed
up). The language switcher (`src/components/language-switcher.tsx`) is now a
larger pill with `text-foreground` so its label is visible on the splash's
`text-white` surface. `npm run build` clean. See CHANGELOG 2026-06-23.

➡️ **Login switched from email → username (rev 42).** The default `password` auth
mode now signs in with a **username** (lowercase letters/digits, 4–20 chars, unique)
plus a password, instead of an email. Each username maps to a deterministic synthetic
Supabase email `<username>@users.local` (mirrors phone auth's `@phone.local`), so RLS
on `auth.uid()` is unchanged and email-uniqueness enforces username-uniqueness — **no
migration**. Admin is also identifiable by username (`ADMIN_USERNAME = "admin"`,
auto-promoted). The two-step login + admin-driven reset flow are preserved. Display
name (`full_name` from onboarding) is kept separate. `npm run build` + `npm run lint`
clean. Admin account = `admin` / `6969` (sign up once to auto-promote). See CHANGELOG
2026-06-23 (rev 42).

➡️ **Podium cards motion pass (rev 41).** Added ambient motion to the FUT podium
cards: each card gently bobs out of phase (gold highest) via `wc-podium-float` on
the `translate` property, hover lifts via the `scale` property (so float + hover
compose), the champion avatar breathes a gold halo, and the crown/medal mark drifts.
Champion's raised offset moved to `margin-block-end` to free the `translate` channel.
All guarded by `prefers-reduced-motion`. `npm run build` clean. See CHANGELOG 2026-06-22 (rev 41).

➡️ **Leaderboard podium → FIFA-style player cards (rev 40).** The top three Board
rows now render as FIFA Ultimate Team–style foil cards (gold/silver/bronze) instead
of the Olympic podium: corner rating = points, medal mark / crown, avatar photo,
uppercase name, and two attributes (EXA = exact hits, ACC = derived accuracy %).
The champion card is raised with an ambient sheen sweep and a `+N ahead` lead-gap
badge over #2. Kept the 2·1·3 ordering, profile links, and current-user highlight.
Old `.wc-podium*` halo/crown/pedestal CSS was replaced by `.wc-fut-card*` reusing
the existing medal gradient/shadow tokens; champion sheen is reduced-motion-guarded.
Added `leaderboard.exactShort` / `accuracyShort` / `ahead` (EN + AR). `npm run build`
and `npm run lint` clean; final visual QA still needs an authenticated browser.
See CHANGELOG 2026-06-21 (rev 40).

➡️ **Leaderboard Board podium + tier ladder (rev 39).** The Board tab now renders
the first three leaderboard rows as an Olympic-style podium ordered 2 · 1 · 3,
with #1 centered, largest, crowned, and using the strongest gold halo/pedestal;
#2 and #3 use silver/bronze companion glows. Everyone below the podium is grouped
into tier sections (Chasers 4-5, Top 10, Top 20, Field) with distinct rank badges,
card density, and accents while preserving the current-user highlight and member
result links. CSS medal tokens and reduced-motion guards were added in
`globals.css`; no scoring/data/RLS changes. `npm run build` and `npm run lint`
clean. Local `/ar/leaderboard` and `/en/leaderboard` requests redirect to login
without an auth cookie, so final visual QA still needs an authenticated browser.
See CHANGELOG 2026-06-21 (rev 39).

➡️ **Hall of Fame crowned-holder redesign (rev 38).** The leaderboard Hall of
Fame tab is now two tiers: a **Crowned** row of the three prestige badges
(Sniper, On Form, Sharpshooter) as premium cards with a gold-ringed glowing
holder avatar and a distinct signature effect each (crown+sparkles / rotating
reticle / momentum spark trail), above a **More honours** grid of the other five.
All effects are pure CSS in `globals.css` built on existing tokens, fully
`prefers-reduced-motion`-guarded; the `computeHallOfFame` data layer is unchanged
(component splits tiers by key). `npm run build` clean. See CHANGELOG 2026-06-21
(rev 38).

➡️ **Crowd Insights on passed matches (rev 37).** After kickoff, the fixture
detail page shows an aggregate recap of what the family predicted: family verdict
(Home/Draw/Away split), most-predicted scorelines + average, and — once a result
exists — "did the family call it?", match podium, bullseye club, and superlatives
(lone wolf / boldest call). All computed in `src/lib/crowd-insights.ts` from the
already-RLS-gated predictions (no DB changes). Replaced the old live-only
`MomentumBar` lean block. Local verification clean (`npm run lint` + `npm run
build`). See CHANGELOG 2026-06-21 (rev 37).

➡️ **Login and signup now hand off by account existence (rev 36).** Unknown
emails at `/login` redirect to `/signup?email=…`; already-registered emails at
`/signup` redirect to `/login?email=…` (both prefill the email). User lookup is
shared in `src/lib/auth/users.ts`. This removes the confusing "email already has
an account" error on signup. Local verification is clean (`npm run lint` +
`npm run build`). See CHANGELOG 2026-06-21 (rev 36).

➡️ **Email + password auth is now the default (rev 35).** Added `/signup`,
email-first `/login`, admin-driven reset from `/admin/users`, migration
`0011_password_reset.sql`, and owner email auto-promotion. Legacy phone and OTP
flows remain behind `NEXT_PUBLIC_AUTH_MODE=phone|otp`; unset/default now resolves
to password. Local verification is clean (`npm run lint` + `npm run build`).
**Next:** apply `0011` live, then run the explicitly-approved fresh-start wipe
(`delete from auth.users;`) if the owner still wants accounts/predictions cleared.
See CHANGELOG 2026-06-20 (rev 35).

➡️ **Leaderboard now carries the scoring explainer (rev 34).** A "How points work"
card sits at the top of `/leaderboard` (above the tabs, so it shows on every tab),
pairing the `<ScoringStrip>` icon visual (7 / 4 / 2 / 0) with the `scoring.footnote`
top-to-bottom rule. `getAppSettings()` was lifted into the page's top-level fetch and
the `my-results` branch reuses it. Reused the existing component + `scoring` strings —
no new component. Local verify clean (`npm run lint` + `npm run build`). **Next:** the
authed mobile/RTL visual pass of the predict page + a member's results, then resume the
still-open items below. See CHANGELOG 2026-06-20 (rev 34).

➡️ **Scoring explainers are now live in the member UI (rev 33).** The owner picked
the **disclosure + strip** options. A reusable `<ScoringDisclosure>` ("How points
work", collapsible) sits under the predict form, and `<ScoringStrip>` (the 7/4/2/0
key) plus per-match **tier badges** (Exact / Right margin / Right winner / Miss,
colour-coded) are on the results breakdown so it's clear *how* each player earned
their points. Values come from `app_settings`; tier derivation in `src/lib/scoring.ts`
mirrors §5. `ar`/`en` strings added under the `scoring` namespace. Local verify clean
(`npm run lint` + `npm run build`). **Next:** authed mobile/RTL visual pass of the
predict page + a member's results, then resume the still-open items below. See
CHANGELOG 2026-06-20 (rev 33).

➡️ **Scoring-explainer exploration shipped to the design tab (rev 32):** a new
**Scoring** section at `/design-system` (`#scoring`) shows five ways to teach the
exact 7 / right-margin 4 / right-winner 2 / miss 0 rules — tiered ladder, by-example,
collapsible disclosure, stat cards, and a compact strip. Sample-data only; no
member-facing UI changed yet. **Next:** owner picks a favourite, then promote it to
a single reusable `<ScoringLegend>` that reads values from `app_settings` and place
it on the predict page (and reuse it as the results-breakdown legend). Local
verification clean (`npm run lint` + `npm run build`). See CHANGELOG 2026-06-20 (rev 32).

➡️ **Fixtures UI cleanup shipped (rev 31): live matches now live in an Ongoing
tab, Upcoming is not-yet-started only, and member-facing flags render once. Still
open: apply `0009_member_stats.sql` + `0010_avatars_storage.sql`, resume 5.2
production activation / 5.3 QA, and run an authed mobile/RTL visual pass.**
Local verification is clean (`npm run lint` + `npm run build`). The next session
should do a logged-in walk of fixtures with and without live matches:
`/fixtures`, `/fixtures?tab=ongoing`, match detail banners, admin fixtures/results,
results breakdown, Arabic RTL and English LTR. See CHANGELOG 2026-06-20 (rev 31).

➡️ **Phase 4.4 Hall of Fame stats and profile avatars are repo-implemented; owner must apply `0009_member_stats.sql` and `0010_avatars_storage.sql`, then resume 5.2 production activation / 5.3 QA.**
Local verification is clean (`npm run lint` + `npm run build`). The new leaderboard tab uses aggregate-only member stats from
`public.get_member_stats()` and the per-player card uses already RLS-filtered
visible result rows. The remaining 4.4 work is live Supabase apply + smoke:
`select * from get_member_stats();`, non-admin RPC execute, privacy sanity, and
mobile/RTL visual QA.

The new avatar work adds a public `avatars` storage bucket with RLS-constrained
member writes, in-browser 512px square compression, onboarding/profile upload and
remove controls, and shared image/initials display on leaderboard, Hall of Fame,
result breakdown, and fixture-reveal member rows. Uploads require live migration
`0010_avatars_storage.sql`.

Phase 5.2 is still dashboard-bound after this: create the Vercel project, add the
production URL to Supabase Auth settings, set GitHub Actions secrets, trigger the
workflow once, and run the production smoke test.

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

Owner refinement (rev 21): phone `+966595440204` now auto-promotes its profile to
admin via server actions, both after first onboarding and on later phone logins.
See CHANGELOG 2026-06-18.

Admin fix (rev 22): the admin phone promotion also runs from the shared profile
read path, so an already signed-in phone session is promoted on the next app
render instead of needing a new login action. See CHANGELOG 2026-06-18.

Admin fix (rev 23): the live `966595440204@phone.local` profile was found with
`is_admin = false` and promoted directly. The allow-list now also recognizes
common Saudi local-number variants (`059...`, national-only, and `9660...`). See
CHANGELOG 2026-06-18.

Leaderboard enhancement (rev 24): added a Hall of Fame tab with 8 aggregate award
badges plus a compact per-player stats strip on result breakdowns. New migration
`0009_member_stats.sql` adds the aggregate-only `get_member_stats()` RPC; owner
must apply it before the tab works against the live database. See CHANGELOG
2026-06-18.

Profile avatar enhancement (rev 25): added optional profile-photo upload during
onboarding and profile editing, stable-path storage replacement at
`avatars/{user_id}/avatar.webp`, removal back to initials, and app-wide avatar
display wherever members appear. New migration `0010_avatars_storage.sql` must be
applied before uploads work live. See CHANGELOG 2026-06-18.

Avatar save fix (rev 26): profile/onboarding Save buttons now stay disabled while
the browser-side avatar upload is still running, preventing the old/empty hidden
`avatarUrl` value from being submitted before the new public URL is ready. See
CHANGELOG 2026-06-18.

Design-tab addition (rev 27): added a "World Cup Patterns" section to the
standalone `/design-system` route that recreates app-specific patterns (fixture
state rows, score steppers + status pills, revealed predictions, leaderboard
rows, stat chips / form dots, result tiles, Hall of Fame award cards, avatar
upload + phone sign-in + admin form mocks, sync log) in the existing emerald/lime
`ds.css` theme. Sample data only; no production screens, APIs, schema, or
translations changed. See CHANGELOG 2026-06-18.

Design-tab addition (rev 28): added a second design-only section "Atmosphere &
Motion" (`sections/football-motion.tsx`) with self-contained CSS/SVG football
visuals — a living stadium banner (grass stripes, floodlight, net, floating
spinning ball), spinning/bouncing/rolling ball loaders, an animated live-momentum
bar + commentary ticker, GOAL! and champion-trophy moment cards with CSS confetti
(gold accent nods to the real WC2026 brand), a penalty-shootout tracker, and SVG
team-kit swatches. Includes a `prefers-reduced-motion` off-switch. Sample data
only; no production screens, APIs, schema, or translations changed. See CHANGELOG
2026-06-18.

Design-tab addition (rev 29): retuned the design-tab palette into a meaning-based
dual-accent system (token-only, no layout change) — a slightly deepened emerald
"pitch" base, **neon lime kept as the energy/live spark** (buttons, hero, charts,
live badge, momentum), and a **new championship-gold achievement accent**
(`--ds-gold-*` + `--ds-gold-gradient`) applied to trophy/champion, Hall of Fame
awards, winning result tile, rank-#1 medal, points-earned, and leading shootout
score. Added a `gold` badge tone and refreshed the Colors section. Gold nods to
the real WC2026 brand. Design-tab only. See CHANGELOG 2026-06-18.

UI refresh (rev 30): brought the design-tab language into the **real app** (not
just `/design-system`). `globals.css` now carries the emerald/lime/gold tokens
(`--lime`/`--gold` registered in `@theme inline`), pitch/lime/gold gradients,
colored glows, a lime stadium-wash background, and the `wc-*` CSS keyframes (all
reduced-motion gated). New shared components — `SoccerBall`, `BallLoader` (replaces
`Loader2` everywhere), `GoalBurst`, `MomentumBar`, `MatchBanner` — plus a `lime`
button variant. Every screen restyled: fixtures cards + "next match" hero,
match-detail banner + live "family lean" bar + exact-score celebration + lime
steppers + gold reveal points, leaderboard medals + colored stat pills, Hall of
Fame gold/shine, results pitch band + gold tiles, lime CTAs + ball loaders on
profile/onboarding/login/avatar/sync. No schema/RLS/API changes; privacy gating
untouched. See CHANGELOG 2026-06-19.

Fixtures UI cleanup (rev 31): added an **Ongoing** tab that appears only when
live matches exist, keeps the default landing tab on Upcoming, renders live
matches as the existing hero banners only, and removes live matches from the
Upcoming grouped list. Added `sideLabel()` beside `sideName()` so member views
that already render a separate flag show a single flag; admin/results views keep
using `sideName()`. See CHANGELOG 2026-06-20.

Owner auth rework (rev 35): default auth is now email + password with no OTP.
Signup creates confirmed Supabase accounts server-side and sends users through
onboarding; login is email-first and routes pending admin resets to a "set new
password" form. `/admin/users` lets admins mark resets and scramble old
passwords. Owner email auto-promotes after profile creation/read. See CHANGELOG
2026-06-20.

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

> Goal: a family member can register and log in, then complete a profile.
> Registration is **open** (per decision §4.3).

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
- ☑ Step 2 — Optional avatar upload delivered: `0010_avatars_storage.sql` creates
  the `avatars` bucket/RLS, onboarding/profile forms persist `avatar_url`, and
  member UI falls back to initials when no photo is set. Live upload requires
  applying `0010` in Supabase.
- ☑ Step 3 — Edit profile (name, locale)

### 1.3 Sessions & route protection ☑

- ☑ Step 1 — Middleware: gate app routes behind auth
- ☑ Step 2 — Sign-out
- ☑ Step 3 — Redirect logic (unauth → login, incomplete profile → setup)

### 1.4 Email + password auth and admin reset ☑

- ☑ Step 1 — `0011_password_reset.sql` adds `profiles.password_reset_pending`
  and explicitly keeps it out of member column grants.
- ☑ Step 2 — `/signup` creates confirmed Supabase auth users with email +
  password, signs them in, and sends them to existing onboarding. An email that
  already has an account redirects to `/login?email=…` instead of erroring
  (rev 36).
- ☑ Step 3 — `/login` defaults to email-first password auth; normal accounts ask
  for the password, pending-reset accounts set a new password, unknown emails
  redirect to `/signup?email=…` (rev 36). `phone` and `otp` modes still render
  behind `NEXT_PUBLIC_AUTH_MODE`.
- ☑ Step 4 — `/admin/users` lists auth users joined to profiles and lets admins
  mark a manual reset, scrambling the old password.
- ☑ Step 5 — Owner email auto-promotion replaces the old email one-off SQL grant;
  phone admin promotion remains for legacy phone mode.

---

## Phase 2 — Data model & admin entry

> Goal: the database exists with privacy enforced, teams + fixtures are loaded,
> and the admin can run the tournament by hand.
>
> **Decisions locked 2026-06-13:** seed data is **web-fetched** from the official
> FIFA 2026 schedule and **owner-verified before commit**; already-kicked-off
> matches are seeded with their **real final scores as display-only** results (not
> scored). Admin grant is now handled by owner email/phone auto-promotion (rev 35).
> Phase 1 is live, so **each migration / policy is verified against the live DB** as it lands. Migrations continue the
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
- ☑ Step 4 — **Admin grant** originally applied live by one-off `UPDATE`; rev 35
  replaces that setup path with owner email/phone auto-promotion for fresh starts.

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

- ☑ Step 1 — Fixtures grouped by date, localized, with Upcoming / Ongoing /
  Finished tabs (Ongoing appears only when live matches exist)
- ☑ Step 2 — Kickoff shown in device-local time; clear "closes at kickoff" state
- ☑ Step 3 — Upcoming matches are predictable and not-yet-started only; Ongoing
  renders live matches as hero banners; past/locked matches render as results-only
  (no prediction input)

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

### 4.4 Hall of Fame stats + player cards ◐

- ☑ Step 1 — `0009_member_stats.sql`: aggregate-only `get_member_stats()` RPC
  returns per-profile totals, tier counts, exact-points setting, streak, last-5,
  average predicted goals, and average prediction lead time. Function mirrors
  `get_leaderboard()` (`SECURITY DEFINER`, pinned `search_path`, grant execute to
  `authenticated`) and returns no individual prediction rows.
- ☑ Step 2 — Pure TypeScript helpers compute the 8 named Hall of Fame badge
  winners and per-player form/streak/favourite/best-match stats.
- ☑ Step 3 — Leaderboard gains the third tab (Board / Hall of Fame / My results);
  member breakdowns and the current user's results tab show the compact stats
  strip. Arabic and English messages are key-for-key.
- ◐ Step 4 — Owner/live verification pending: apply migration `0009`, sanity
  `select * from get_member_stats();`, confirm non-admin authenticated RPC access,
  spot-check badge winners, and run mobile RTL/LTR smoke.

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
  `https://<app>.vercel.app/**`, and confirm Email provider settings. Magic Link
  token copy only matters if `NEXT_PUBLIC_AUTH_MODE=otp`.
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
