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

## 2026-06-26 - Hall of Fame opacity and podium initials follow-up
**Plan item:** Mobile UI polish follow-up   **Status:** done (lint + build clean; dev route smoke checked)

**What changed**
- Replaced `bg-muted/30` with solid `bg-muted` for unawarded crowned and standard
  Hall of Fame cards, while keeping their dashed borders.
- Added `color: var(--wc-fut-ink, #1e293b)` to `.wc-fut-card__avatar` so fallback
  initials contrast on the white-glass podium avatar background.

**Why**
- `bg-muted/30` merged over the `Card` component's `bg-card` and left empty badge
  cards translucent on darker mobile backgrounds.
- Podium fallback initials inherited near-white avatar text on a near-white glass
  circle; medal-specific dark ink keeps initials readable without changing photo
  avatars.

**Files touched**
- src/components/hall-of-fame.tsx
- src/app/globals.css
- docs/BUILD-PLAN.md
- docs/CHANGELOG.md

**Notes / gotchas**
- Local dev smoke checked non-mutating routes: `/ar` returned 200,
  `/en/design-system` returned 200, and unauthenticated `/en/leaderboard`
  redirected to `/en/login` as expected. Authenticated phone-width visual QA still
  needs a browser session for the real leaderboard tabs.

## 2026-06-26 - Mobile UI polish: scores, podium, Hall of Fame, avatars, reveal links
**Plan item:** Mobile UI polish batch   **Status:** done (lint + build clean)

**What changed**
- Prevented finished-match score badges from wrapping at the hyphen in the fixtures list
  and member results breakdown by adding no-wrap centered badge text.
- Reflowed the top-3 leaderboard podium on mobile: champion spans the top row, silver
  and bronze sit side-by-side below, and the original 2-1-3 desktop podium returns at
  `sm+`. The champion lift margin now only applies at `sm+` so mobile spacing stays tight.
- Strengthened Hall of Fame awarded crowned cards with a deeper gold wash, and replaced
  unawarded card opacity fades with solid muted dashed-card treatments.
- Made avatar initials a solid high-contrast primary chip instead of a faint tint.
- Turned revealed prediction cards on past match pages into locale-aware profile links
  to `/leaderboard/<userId>` with row hover affordance.

**Why**
- Direct mobile polish pass: scorelines needed to stay legible, podium cards needed
  breathing room, empty HoF cards needed to look solid rather than transparent, initials
  needed clearer contrast, and revealed predictions should let members jump to profiles.

**Files touched**
- src/app/[locale]/(app)/fixtures/page.tsx
- src/app/[locale]/(app)/fixtures/[id]/page.tsx
- src/app/[locale]/(app)/leaderboard/page.tsx
- src/app/globals.css
- src/components/hall-of-fame.tsx
- src/components/results-breakdown.tsx
- src/components/ui/avatar.tsx
- docs/BUILD-PLAN.md
- docs/CHANGELOG.md

**Notes / gotchas**
- This remains a light-mode-only fix; no `next-themes` wiring or dark-mode toggle was added.
- Authenticated mobile visual QA still needs a logged-in browser/session, but static checks
  passed: `npm run lint` and `npm run build`.

## 2026-06-26 — Copywriting & UX polish (scoring labels, Hall of Fame, splash skip, competition framing)
**Plan item:** Copy/UX polish pass   **Status:** done (build clean)

**What changed**
- **Scoring labels (ar + en):** `marginTitle` "الفارق الصحيح" → "فارق الأهداف الصحيح"
  ("Right margin" → "Right goal difference"); `missTitle` "بعيد" → "نتيجة خاطئة"
  ("Miss" → "Wrong result"). Reworded `missBlurb` to "ولا رقم صح." / "Neither
  number right." so it no longer duplicates the new title.
- **Hall of Fame description:** reframed from "في العائلة" (family) to "في السيرفر"
  (server) and expanded to explain badges are auto-awarded by accuracy, streaks,
  and scoring rate.
- **Hall of Fame standard cards:** the 5 lower badges were laid out in a grid that
  left a lone card on the last row. Switched to `flex flex-wrap justify-center`
  with per-card width wrappers (`w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)]`)
  → centered 3+2 on desktop, 2+2+centered-1 on mobile.
- **Splash skip:** signed-in users now skip the `/[locale]` splash. Added a
  `getCurrentUser()` check that `redirect`s to `/fixtures` before rendering.
- **Competition framing:** added `common.competition` ("بطولة توقّع مباريات كأس
  العالم" / "FIFA World Cup match-prediction tournament"), surfaced on the landing
  hero (under the wordmark) and as an eyebrow on the login/signup cards (new
  optional `eyebrow` prop on `AuthCard`).

**Why**
- Direct copywriting feedback from the user; the family→server reframing matches
  the existing "ناس السيرفر" tagline wording. The splash adds friction for
  returning users. The competition line makes the app's purpose explicit at every
  entry point.

**Files touched**
- messages/ar.json, messages/en.json
- src/components/hall-of-fame.tsx
- src/app/[locale]/page.tsx
- src/app/[locale]/(auth)/auth-card.tsx
- src/app/[locale]/(auth)/login/page.tsx
- src/app/[locale]/(auth)/signup/page.tsx

**Notes / gotchas**
- `/[locale]` is now a dynamic route (`ƒ`) because it reads the auth cookie via
  `getCurrentUser()`; it was effectively static before. Expected.

---

## 2026-06-26 — Redesign podium prizes & honours by shape (bars vs medallions)
**Plan item:** Leaderboard polish (rev 46)   **Status:** done (build clean)

**What changed**
- Prizes and Hall-of-Fame honours on the top-3 cards still blended (both white
  icon+label pills stacked ~1.6px apart). Reworked so they differ by **shape**:
  - **Prizes → big full-width bars.** `.wc-prize` is now a vertical stack of
    full-width banners (`flex-direction: column`, chips `width:100%`), larger
    padding (`0.52rem 0.7rem`), bigger radius (`0.85rem`), icon `1.05rem→1.3rem`,
    label `0.72rem→0.85rem`. Champion card bumps its cash bar even larger.
    Eyebrow kept and slightly enlarged. Cash gradient/coins, Nitro, role accent
    all preserved (just scaled). Full-width centered bars are RTL-symmetric, so
    the previously-missing `:dir(rtl)` padding flip is no longer needed.
  - **Honours → small round icon-only medallions.** `CardAchievements` now
    renders just the colored icon (`size-3→size-4`) in a `2rem` circle; the
    label moved to an `sr-only` span (title tooltip + container aria-label kept
    for a11y). Removed unused `.wc-fut-card__badge-icon`/`-label` CSS.

**Why**
- User feedback: prizes and badges were confusing/mixing; make prizes even
  bigger. Chosen direction: differentiate by shape (big labeled bars vs round
  medals) so they're unmistakable. Scope: podium cards only.

**Files touched**
- src/app/[locale]/(app)/leaderboard/page.tsx (`CardAchievements` JSX)
- src/app/globals.css (`.wc-prize*`, `.wc-fut-card__badge*`)

**Notes / gotchas**
- Hall of Fame page (`src/components/hall-of-fame.tsx`) intentionally unchanged.

---

## 2026-06-26 — Make podium prizes prominent, distinct, and green
**Plan item:** Leaderboard polish (rev 45)   **Status:** done (build clean)

**What changed**
- The podium prize chips read too much like the Hall-of-Fame badges on the same card
  (both white pills with a small icon + tiny uppercase label; cash even used gold, the
  HoF palette). Reworked so prizes clearly dominate the top-3 cards:
  - Added a visible **"PRIZE" eyebrow** (`wc-prize__eyebrow`, lucide `Trophy`) above the
    chip group, using the existing `prizes.label` string — heads the group so it never
    reads as a badge row.
  - **Bigger chips** vs HoF badges: larger padding, label `0.62rem→0.72rem` weight 900,
    icon `0.82rem→1.05rem`.
  - **Cash → bold solid green prize tag** (`#16a34a→#15803d`, white text) with a new
    pulsing green halo keyframe `wc-cash-glow` (green analogue of `wc-nitro-glow`).
  - **Money effect much bigger & green**: coins now green (`#4ade80`, green glow),
    `0.62rem→0.86rem`; 5 particles (was 3); `wc-coin-rise` travel `-15px→-26px`.
- Cash glow + coins disabled under `prefers-reduced-motion`.

**Why**
- User feedback: prizes should be the most apparent element of the top-3 cards, clearly
  separate from HoF badges; money effect should be bigger and green.

**Files touched**
- src/app/[locale]/(app)/leaderboard/page.tsx (eyebrow JSX, `COIN_PARTICLES`)
- src/app/globals.css (`.wc-prize*`, `wc-coin-rise`, new `wc-cash-glow`, reduced-motion)

**Notes / gotchas**
- Only the **cash** chip turned green; Nitro/role keep their purple palette and inherit
  the new larger base sizing. `Trophy` was already imported in the page.

## 2026-06-26 — Leaderboard prize badges (Discord tournament rewards)
**Plan item:** Leaderboard polish (rev 44)   **Status:** done (lint + build clean)

**What changed**
- Added a `CardPrize` component to the leaderboard podium (top-3 FUT cards) that
  renders the tournament reward chips **directly under each player's name**:
  - **Gold (1st):** "50 SAR" cash chip (lucide `Coins`, gold sheen) with three
    floating `$` coin particles (`wc-coin-rise`) **+ Custom Role** chip.
  - **Silver (2nd):** purple **Nitro** chip (lucide `Gem` stand-in) with a pulsing
    purple glow (`wc-nitro-glow`) **+ Custom Role** chip.
  - **Bronze (3rd):** **Nitro** chip only.
- Prizes are a hardcoded `PODIUM_PRIZES` map keyed by medal (display-only, mirrors
  the existing scoring-tier pattern — not stored in the DB).
- "Custom Role" renders as a **Discord-style role pill**: a blurple→purple dot
  (`wc-prize__role-dot`) + uppercase label.
- New `.wc-prize*` styles + `wc-coin-rise` / `wc-nitro-glow` keyframes in
  `globals.css`, modeled on the existing `.wc-fut-card__badge` chip. RTL-safe
  (logical properties only) and disabled/hidden under `prefers-reduced-motion`.
- Added `leaderboard.prizes.{label,cash,nitro,customRole}` strings to `en.json`
  and `ar.json` (Arabic: ٥٠ ر.س / نيترو / رتبة مخصصة).
- Mirrored the chips into the design-system podium preview (`PreviewPrize` in
  `sections/world-cup.tsx`) so the effect is viewable at `/[locale]/design-system`
  without seeding leaderboard data or signing in.

**Why**
- The prediction competition runs in a Discord server with real prizes (1st = 50 SAR
  + custom role, 2nd = Nitro + custom role, 3rd = Nitro). Surfacing the reward next to
  each top player on the board is meant to motivate members.
- Nitro uses a lucide `Gem` stand-in per the user's choice (real Nitro art can be
  swapped in later); custom-role pill chosen for the most on-theme Discord look.

**Files touched**
- src/app/[locale]/(app)/leaderboard/page.tsx (CardPrize, PODIUM_PRIZES, COIN_PARTICLES, icon imports)
- src/app/globals.css (.wc-prize* block, wc-coin-rise/wc-nitro-glow keyframes, reduced-motion entries)
- messages/en.json, messages/ar.json (leaderboard.prizes.*)
- src/app/[locale]/design-system/sections/world-cup.tsx (PreviewPrize in PodiumPreview)

**Notes / gotchas**
- Prizes only show on the podium (ranks 1-3); the rank 4+ `BoardRow` list is unchanged.
- To swap the real Discord Nitro icon: replace the `Gem` import/usage in `CardPrize`
  (and `PreviewPrize`) with an `<img src="/...">` asset dropped in `public/`.
- The design-system `PodiumPreview` is the legacy "color-option comparison" scaffold
  marked for eventual deletion — if it's removed, `PreviewPrize` goes with it; the real
  feature lives entirely in the leaderboard page.

## 2026-06-24 — Landing splash redesign + brand font swap
**Plan item:** Branding polish   **Status:** done (build clean)

**What changed**
- Swapped the "Sudanship" wordmark font from **Anton** to **Bebas Neue**
  (`next/font/google`, still `--font-display`); bumped `.wc-wordmark`
  letter-spacing to `0.06em` for the taller, narrower face.
- Redesigned the locale-root splash (`src/app/[locale]/page.tsx`): added two
  blurred floodlight glow blobs behind the content, turned the "welcome" kicker
  into a bordered glass pill, and enlarged the CTA to `h-14 px-10 text-lg` with
  a hover/focus scale.
- Enlarged the hero artwork in `BrandWordmark` (`h-32/44` → `h-56/72/80`) and
  wrapped it in a new `.wc-splash__art` element: a breathing lime/gold halo
  (`::before`, `wc-halo-pulse`) plus a floating drop-shadowed image
  (`wc-float`). Both honour `prefers-reduced-motion`.

**Why**
- The splash is the brand front door; the user asked for a bigger image and a
  fresher, more professional landing with a different wordmark font.

**Files touched**
- src/app/[locale]/layout.tsx
- src/app/[locale]/page.tsx
- src/components/brand-wordmark.tsx
- src/app/globals.css

**Notes / gotchas**
- Bebas Neue is Latin-only and all-caps (same constraints as Anton); the
  wordmark stays the Latin "SUDANSHIP".

---

## 2026-06-23 — Banner real transparency + language switcher visibility
**Plan item:** Branding polish   **Status:** done (build clean)

**What changed**
- `public/sudanship-banner.png` was actually RGB (no alpha) with the
  "transparency" checkerboard painted as opaque light-gray pixels — it rendered
  as a light box around the player on the dark splash pitch. Added a one-off
  `scripts/make-banner-transparent.mjs` (sharp) that keys out the light,
  near-grayscale background to alpha=0 and re-exports a true RGBA PNG. Original
  kept at `public/sudanship-banner.rgb-backup.png`. ~78% of pixels cleared.
- `src/components/language-switcher.tsx`: the outline button now sets
  `text-foreground` and a larger pill (`h-9 rounded-full px-4 text-sm
  font-semibold`). Fixes the splash where the label inherited the parent's
  `text-white` and was invisible, and makes it bigger everywhere.

**Why**
- The image had no alpha at all — `file` reported `8-bit/color RGB`. A CSS-only
  fix was impossible; the source PNG itself had to be re-keyed.
- The outline variant gives `bg-background` but no text color, so on a
  `text-white` parent the label disappeared. `text-foreground` makes it
  self-contained on any surface and theme.

**Files touched**
- scripts/make-banner-transparent.mjs (new, one-off)
- public/sudanship-banner.png (regenerated RGBA), public/sudanship-banner.rgb-backup.png (new)
- src/components/language-switcher.tsx

**Notes / gotchas**
- Background-key thresholds: `min(r,g,b) > 150` AND `max-min < 24`. If a future
  banner art contains light/gray regions, re-tune or supply a clean transparent
  source. The script is idempotent (skips backup if it exists).

## 2026-06-23 — "Sudanship" splash landing + brand wordmark (rev 43)
**Plan item:** Branding: splash page + logo banner   **Status:** done (build clean)

**What changed**
- Added the kicking-player artwork at `public/sudanship-banner.png` (transparent
  PNG, 1916×821).
- New reusable `BrandWordmark` component (`src/components/brand-wordmark.tsx`):
  artwork + the text "Sudanship" in the Anton athletic display font (uppercase).
  `size="sm"` for
  the header, `size="hero"` for the splash; `tone="dark"` brightens the wordmark
  for dark backgrounds.
- The locale root `src/app/[locale]/page.tsx` no longer redirects to `/fixtures`;
  it now renders a full-screen **splash hero** (pitch-gradient bg, language
  switcher, welcome kicker, hero wordmark, tagline, lime **Start** button → `/fixtures`).
- The logged-in header (`src/app/[locale]/(app)/layout.tsx`) swaps the old
  soccer-ball icon + `appName` for `<BrandWordmark size="sm" />`.
- Loaded **Anton** via `next/font/google` as `--font-display` in
  `src/app/[locale]/layout.tsx`; added `.font-display`, `.wc-wordmark`, and
  `.wc-wordmark--on-dark` utilities to `src/app/globals.css`.
- Added `common.welcome` to `messages/en.json` ("Welcome to") and
  `messages/ar.json` ("أهلاً بيك في").

**Why**
- The user wanted a branded front door instead of dropping visitors straight on
  the login form, plus the same logo banner inside the app. The wordmark font
  started as Great Vibes (cursive) but the user asked for a bigger, on-theme look,
  so it's now **Anton** (athletic display caps) at larger sizes; splash set to
  always show; header wordmark replaced (all confirmed with the user).

**Files touched**
- public/sudanship-banner.png (new)
- src/components/brand-wordmark.tsx (new)
- src/app/[locale]/page.tsx
- src/app/[locale]/layout.tsx
- src/app/[locale]/(app)/layout.tsx
- src/app/globals.css
- messages/en.json, messages/ar.json

**Notes / gotchas**
- The shadcn `Button` here (base-ui) has **no `asChild`** — to render a `Link` as
  a button use `buttonVariants({ variant, size, className })` on the `Link`.
- The Start button links to `/fixtures`; the existing Supabase middleware does the
  auth routing (signed-in → fixtures, else → login). No new auth logic.
- The splash is always shown at the root (not first-visit-only).
- Anton is Latin-only and all-caps; the wordmark stays the Latin "SUDANSHIP" in
  both locales (`.wc-wordmark` applies `text-transform: uppercase`).

---

## 2026-06-23 — Login by username instead of email
**Plan item:** Auth: username + password login   **Status:** done (build clean)

**What changed**
- Sign-up and login now use a **username** (not an email). A username is
  lowercase letters/digits only, 4–20 chars, no spaces/symbols, and must be
  unique. The two-step login flow (enter identifier → password) is kept; the
  first step now asks for the username and shows a rules hint on sign-up.
- Each username maps to a deterministic **synthetic Supabase email**
  `<username>@users.local` (same trick as phone auth's `@phone.local`), so RLS
  keyed on `auth.uid()` is unchanged and Supabase's `auth.users.email`
  uniqueness enforces username uniqueness — **no DB migration**.
- Added username helpers (`normalizeUsername`, `isValidUsername`,
  `usernameToEmail`, `usernameFromSyntheticEmail`, length constants) to
  `password-policy.ts`; `findUserByUsername` to `users.ts`.
- Admin is now also identified by username: `ADMIN_USERNAME = "admin"` +
  `isAdminUsername` / `promoteUsernameAdminProfile`, wired into the signup/login
  actions and `getProfile` auto-promotion (alongside the existing email/phone
  admin checks, which remain).
- i18n: added `usernameLabel`/`usernamePlaceholder`/`usernameHint` and
  `invalidUsername`/`usernameTaken` errors; password/enter/set-password copy now
  interpolates `{username}` (en + ar).

**Why**
- Owner wants a friendlier family login (pick a name, not an email). Synthetic
  email reuses the proven phone-auth pattern and avoids schema/RLS churn.

**Files touched**
- src/lib/auth/password-policy.ts, src/lib/auth/users.ts,
  src/lib/auth/phone-admin.ts, src/lib/profile.ts
- src/app/[locale]/(auth)/signup/{actions.ts,signup-form.tsx,page.tsx}
- src/app/[locale]/(auth)/login/{password-actions.ts,password-login-form.tsx,page.tsx}
- messages/en.json, messages/ar.json

**Notes / gotchas**
- The **admin account** is username `admin` (owner uses password `6969`): sign
  up with it once and it auto-promotes to admin. The old gmail-based admin
  account is now unreachable via the UI (email/OTP/phone modes still compile but
  aren't the default `password` mode).
- "Stay logged in" already works in code: `src/proxy.ts` → `updateSession`
  refreshes the Supabase session every request. To extend session lifetime in
  prod, set Supabase Dashboard → Authentication → Sessions (disable inactivity
  timeout / time-box). No code change.

---

## 2026-06-22 — Podium cards show Hall-of-Fame honours
**Plan item:** Board tab podium polish   **Status:** done (build clean)

**What changed**
- Top-3 podium FUT cards now display any **Hall-of-Fame badges** their holder
  currently owns, as a centered wrapping row of labeled pills (tinted icon + the
  award **name**, e.g. "SNIPER") between the name and the attribute grid. Pills
  carry a native tooltip and flip padding under RTL.
- The board tab now also calls `getMemberStats()` + `computeHallOfFame()` (only
  when a podium exists) and folds the result into a `Map<userId, BadgeKey[]>`
  passed to `<Podium>`. Wrapped in the same `MemberStatsUnavailableError`
  try/catch the Hall-of-Fame tab uses, so a missing RPC just means no chips.
- Exported `BADGE_META` from `hall-of-fame.tsx` so the page reuses the existing
  icon + tone mapping instead of duplicating it.
- Added `.wc-fut-card__badges` / `.wc-fut-card__badge` styles (white glassy
  circular chips; unlayered bg intentionally overrides the Tailwind tint so only
  the colored icon shows, keeping legibility on the medal glass).

**Why**
- Ties the two leaderboard surfaces together — you can see *why* someone is on the
  podium (sniper, on-form, etc.) without switching tabs. Reuses computed data, no
  new query shape or RLS change.

**Files touched**
- src/app/[locale]/(app)/leaderboard/page.tsx
- src/components/hall-of-fame.tsx
- src/app/globals.css

**Notes / gotchas**
- Board tab now issues the member-stats RPC on every render where a podium exists
  (previously only the Hall-of-Fame tab did). Same call, so no new failure mode,
  but it is an extra query on the most-visited tab — fine at family scale.

---

## 2026-06-22 — Podium player cards: 6-stat FUT attribute grid
**Plan item:** Board tab podium polish   **Status:** done (build clean)

**What changed**
- Expanded the top-3 podium FUT cards from **2 attributes (EXA, ACC)** to a full
  **6-stat FUT-style grid**: EXA (exact), GDF (goal-diff hits), WIN (winner hits),
  ACC (accuracy %), PLD (predictions made), PPG (points per scored match).
- Added `pointsPerMatch()` helper in the leaderboard page — `total_points /
  scored_count`, one decimal, guarded against divide-by-zero.
- Reworked `.wc-fut-card__attrs` from a centered flex row into a **3×2 grid** with
  thin inline dividers on the middle column; champion card gets slightly larger
  gaps. Shrank the attribute label size to fit three columns.
- New i18n short labels (`goalDiffShort`, `winnerShort`, `playedShort`,
  `ppgShort`) in `en.json` + `ar.json`.

**Why**
- The cards had lots of empty real estate and only two numbers; FUT cards are
  recognizable precisely for their dense attribute block. PPG is the most
  "interesting" addition — a per-match rating that rewards efficiency, not just
  volume, so a player who predicted fewer matches well still reads as strong.

**Files touched**
- src/app/[locale]/(app)/leaderboard/page.tsx
- src/app/globals.css
- messages/en.json
- messages/ar.json

**Notes / gotchas**
- All six stats come from existing `LeaderboardRow` fields — no query/RLS change.
- Arabic `ppgShort` is "المعدل" (not a literal "pts/match") to keep the tiny label
  from wrapping; revisit if a clearer term is wanted.

---

## 2026-06-22 — Leaderboard palette harmony + rank-5 parity
**Plan item:** Board tab hierarchy polish (revision)   **Status:** done (build clean)

**What changed**
- Recolored the podium FUT cards onto the **brand palette** instead of literal
  metals (metallic silver/bronze are off-theme by nature). New trio: **gold (1st,
  unchanged) → emerald (2nd) → lime (3rd)** — a warm-to-green descent using only
  the stadium colors. `.wc-fut-card--silver` is now emerald glass, `--bronze` is
  lime glass; both keep the light glassy finish + dark ink so contrast holds. Class
  names left as `--silver`/`--bronze` because the medal/rank wiring keys off them.
- (Superseded the earlier platinum re-tone of silver, which still clashed.)
- Rank **5** now gets the same highlighted card treatment as rank 4: added a
  `wc-board-card--rank5` class (page) and folded it into the rank-4 selectors in
  `globals.css` (base blur, light + dark gradients). Both ranks already shared the
  `"chase"` tier; only the decorative glow class was missing on rank 5.

**Why**
- User reported the top-3 medal colors clashed with the theme — the silver card's
  blue-gray was the offender. And rank 5 looked plainer than rank 4 despite being
  the same tier, because only rank 4 carried the glow class.

**Files touched**
- src/app/[locale]/(app)/leaderboard/page.tsx
- src/app/globals.css

**Notes / gotchas**
- `.wc-board-card--rank4` and `--rank5` are now aliases sharing one ruleset; keep
  them together if re-toning.

---

## 2026-06-22 — Podium cards motion pass (floaty)
**Plan item:** Engagement / Board tab hierarchy polish (revision)   **Status:** done (build clean)

**What changed**
- Added tasteful continuous motion to the FUT podium cards so they don't read as
  static/stale:
  - Each card gently **bobs** out of phase (gold floats highest), via a new
    `wc-podium-float` keyframe on the **`translate`** property so the hover
    response composes instead of fighting it.
  - Hover now lifts via the **`scale`** property (1.04) plus a slight
    saturate/brightness bump — clean because `translate` (float) and `scale`
    (hover) are independent transform channels.
  - Champion avatar gets a soft breathing gold halo (`wc-fut-glow`); the corner
    crown/medal mark drifts + tilts (`wc-fut-crown`).
- Champion's raised offset moved from `transform` to `margin-block-end` to keep
  the `translate` channel free for the float.
- All new motion is disabled under `prefers-reduced-motion`.

**Why**
- Follow-up to the same-day card redesign: user wanted it "floaty", with motion a
  pro designer would add. Using individual transform properties (`translate` /
  `scale`) is the idiomatic way to layer an ambient loop with an interactive state.

**Files touched**
- src/app/[locale]/(app)/leaderboard/page.tsx (added `wc-fut-card__mark` class)
- src/app/globals.css

**Notes / gotchas**
- Relies on the individual `translate`/`scale` CSS properties (all modern browsers).
  Don't reintroduce a `transform`-based float here — it would clobber the hover scale.

---

## 2026-06-21 — Leaderboard podium → FIFA-style player cards
**Plan item:** Engagement / Board tab hierarchy polish (revision)   **Status:** done (build + lint clean)

**What changed**
- Replaced the top-3 Olympic-podium treatment with **FIFA Ultimate Team–style
  player cards** to give the section real substance instead of generic glow.
  - Each top-3 member is a vertical foil card (gold/silver/bronze gradient
    finish): corner "rating" = total points, medal mark (🥇/🥈/🥉; crown for #1),
    avatar "photo", uppercase name, and two attributes — **EXA** (`exact_count`)
    and **ACC** (derived accuracy %).
  - Champion card is raised, has a slow ambient sheen sweep, and shows a
    **lead-gap** badge (`+N ahead`) over #2 when the gap is > 0.
  - Kept the 2·1·3 ordering via `[direction:ltr]`, profile links, and the
    `mine` highlight (now an outline ring).
- Dropped the animated halos / bobbing crown / pedestal blocks (`.wc-podium*`)
  in favour of new `.wc-fut-card*` classes reusing the existing
  `--gradient-*` / `--shadow-*` medal tokens.
- Added `leaderboard.exactShort` / `accuracyShort` / `ahead` keys (EN + AR).

**Why**
- The previous podium read as "AI-generated": lots of decorative glow, almost no
  per-player information. Cards trade decoration for stats and a distinct identity.

**Files touched**
- src/app/[locale]/(app)/leaderboard/page.tsx
- src/app/globals.css
- messages/en.json, messages/ar.json

**Notes / gotchas**
- Accuracy is computed in-page (`accuracyPct`), guarded against `scored_count === 0`.
- `.wc-podium*` styles were fully removed; the champion sheen (`wc-fut-card--champion::before`)
  is disabled under `prefers-reduced-motion`. `wc-crown-bob` keyframe is still used by Hall of Fame.

---

## 2026-06-21 — Leaderboard Board podium + tier ladder
**Plan item:** Engagement / Board tab hierarchy polish (new)   **Status:** done (build + lint clean)

**What changed**
- Reworked the leaderboard **Board** tab so the top three members render as a
  linked Olympic podium ordered **2 · 1 · 3**:
  - #1 is centered, tallest, largest avatar (`size-20`), crowned, and gets the
    strongest animated gold halo plus a gold pedestal sheen.
  - #2 and #3 use smaller avatars (`size-16`) with silver and bronze halos,
    rings, and descending pedestal heights.
- Replaced the flat all-member `<ol>` with podium + tiered field sections:
  - Chasers (ranks 4-5): lime badge/border and elevated glow.
  - Top 10: primary/emerald badge and standard density.
  - Top 20: cool slate/blue tint.
  - Field: compact muted rows.
- Added `rankTier()` and kept `BoardRow`'s link/stat layout, current-user
  highlight, and per-member result routes unchanged.
- Added `champion` and tier-header strings in `messages/en.json` and
  `messages/ar.json`.
- Added silver/bronze gradient + shadow tokens and `.wc-podium*` CSS utilities
  in `globals.css`, with reduced-motion entries for the new halo/crown/shine.

**Why**
- The old Board tab treated every member like an identical row. The podium and
  tier ladder make rank feel earned while staying inside the existing football
  glow/halo/shine language.

**Files touched**
- src/app/[locale]/(app)/leaderboard/page.tsx (podium component, tier helpers, grouped Board render)
- src/app/globals.css (silver/bronze tokens, podium avatar/halo/pedestal styles, reduced motion)
- messages/en.json, messages/ar.json (new leaderboard labels)
- docs/BUILD-PLAN.md, docs/CHANGELOG.md (workflow update)

**Notes / gotchas**
- No DB/RLS/scoring changes. The podium uses the first three rows returned by
  `getLeaderboard()`; tier styling below it is based on each row's `rank`.
- The podium grid pins visual order with `[direction:ltr]` so 2 · 1 · 3 stays
  left-to-right in Arabic and English; member names use `dir="auto"`.
- Fewer than three members skips the podium and sends all rows through the field
  list path.
- Verification: `npm run build` clean, `npm run lint` clean. Local
  `/ar/leaderboard` and `/en/leaderboard` requests reached the dev server but
  redirected to login without an auth cookie, so authenticated visual QA remains
  the one check to do in-browser.

---

## 2026-06-21 — Hall of Fame crowned-holder redesign
**Plan item:** Engagement / Hall of Fame polish (new)   **Status:** done (build clean)

**What changed**
- Reworked the leaderboard **Hall of Fame** tab from one flat 8-card grid into a
  two-tier layout with a kicker + description header:
  - **Crowned** row — the three prestige badges (Sniper, On Form, Sharpshooter)
    as larger premium cards with a gold-ringed, glowing holder avatar and a
    **distinct signature effect each**:
    - *Sharpshooter → royalty:* floating bobbing gold crown + twinkling sparkles,
      violet/gold aura.
    - *Sniper → marksman lock-on:* rotating dashed reticle + counter-rotating
      broken ring + pulsing lock glint, emerald aura.
    - *On Form → momentum:* rising spark trail behind the avatar + pulsing
      up-chevron, sky aura.
  - **More honours** grid — the remaining five badges in the polished compact grid.
- Added CSS for the crowned avatar base + the three effects and their keyframes
  in `globals.css`, all built on existing tokens (`--gold`/`--lime`,
  `wc-trophy__halo`/`__shine`, `wc-momentum-sweep`). Every new animated class is
  added to the `prefers-reduced-motion` block (crown/reticle/aura stay as static
  styling; sparkles/glint/spark layers hide so there's no frozen artifact).
- Added `description`, `crownedTitle`, `moreTitle` keys under
  `leaderboard.hallOfFame` in both `en.json` and `ar.json`.

**Why**
- The old Hall of Fame felt flat — a holder looked identical whether they'd won a
  badge or not. The crown/aura makes winning read as an *achievement*, and giving
  each prestige badge its own effect ties the visual to the badge's meaning.

**Files touched**
- src/components/hall-of-fame.tsx (two-tier layout, CrownedAvatar/CrownedCard/StandardCard)
- src/app/globals.css (crowned-holder styles, keyframes, reduced-motion entries)
- messages/en.json, messages/ar.json (3 new hallOfFame keys)

**Notes / gotchas**
- `computeHallOfFame` data layer is unchanged; the component splits tiers by key
  (`CROWNED_KEYS`), so `EmptyState` / setup-pending paths are untouched.
- Sparkle/spark positions use logical props (`insetInlineStart/End`) so the
  layout stays RTL-safe. CardHeader is a CSS grid → centered via
  `justify-items-center`, not `items-center`.
- `npm run build` clean (TypeScript + static gen).

---

## 2026-06-21 — Crowd insights on passed matches
**Plan item:** Engagement / match recap (new)   **Status:** done (local verify clean)

**What changed**
- After a match kicks off, the fixture detail page now shows a **Crowd Insights**
  panel summarising what the whole family predicted, replacing the old live-only
  2-way "family lean" `MomentumBar` block.
- Consensus cards (shown for any post-kickoff match, live or finished):
  - **Family verdict** — 3-segment bar of Home win / Draw / Away win with counts,
    percentages, and the crowd favourite highlighted.
  - **Most predicted score** — top 3 scorelines with counts/percentages, plus the
    family-average scoreline and total goals expected.
- Result-dependent cards (only once a final score exists):
  - **Did the family call it?** — nailed / fooled / split verdict vs the actual outcome.
  - **Match podium** — top 3 point earners on this match (points derived locally).
  - **Bullseye club** — members who hit the exact score.
  - **Superlatives** — lone wolf (only one to back the actual winner, needs ≥3 picks)
    and boldest call (most goals predicted).

**Why**
- Passed matches had no aggregate payoff — only the per-person `RevealList`. This
  turns opening a finished match into a mini results-show recap and drives engagement.

**Files touched**
- src/lib/crowd-insights.ts (new — pure `computeCrowdInsights`)
- src/components/crowd-insights.tsx (new — async server component, RTL-safe)
- src/app/[locale]/(app)/fixtures/[id]/page.tsx (wire-in; removed lean block)
- messages/en.json, messages/ar.json (new `predict.*` keys, Arabic-first)

**Notes / gotchas**
- **No DB/RLS/migration changes.** All insights are computed from the existing
  `getMatchPredictions` result, which RLS already gates by `now() >= kickoff_at`,
  so nothing is revealed before kickoff. The panel reuses the existing `showReveal`
  gate, so it never renders pre-kickoff.
- Points for podium/bullseye are derived locally via `scoreTier`/`tierPoints`
  (from `app_settings`), so cards are correct even before `score_match()` has run.
- `momentum-bar.tsx` is now unused (left in place as a generic component).
- Unused `predict.leanTitle` / `predict.leanCaption` keys retained (harmless).

## 2026-06-21 — Cross-link login/signup by account existence
**Plan item:** Auth rework / Phase 1.4 (follow-up)   **Status:** done (local verify clean)

**What changed**
- `/login`: an email with **no** account no longer shows an intermediate
  "No account found" card — `lookupLogin` now redirects straight to
  `/signup?email=…` (email prefilled). The `not_found` step and its UI block
  were removed.
- `/signup`: an email that **already** has an account no longer falls through to
  `createUser` and a red error — `signUpWithEmailPassword` checks existence up
  front and redirects to `/login?email=…` (email prefilled). The `createUser`
  "already registered" → `emailTaken` mapping stays as a race-condition guard.
- Extracted the user lookup into shared server-only `src/lib/auth/users.ts`
  (`findUserByEmail`); both login and signup actions import it.
- `/login` and `/signup` pages read `?email=` from `searchParams` and prefill the
  email field (login form seeds its email state; signup uses `defaultValue`).

**Why**
- Reported UX/bug: signing up with an existing email "gave an error." That error
  was the by-design duplicate guard (Supabase `createUser` rejects a known email →
  `emailTaken`), but landing on a red message is confusing. Redirecting to login
  (and login→signup for new emails) makes the two screens hand off cleanly.
- The up-front existence check is reliable regardless of GoTrue's error wording,
  so the fragile `/already|registered|exists/i` string match is no longer the
  primary path.

**Files touched**
- src/lib/auth/users.ts (new — shared `findUserByEmail`)
- src/app/[locale]/(auth)/login/password-actions.ts
- src/app/[locale]/(auth)/login/password-login-form.tsx
- src/app/[locale]/(auth)/login/page.tsx
- src/app/[locale]/(auth)/signup/actions.ts
- src/app/[locale]/(auth)/signup/signup-form.tsx
- src/app/[locale]/(auth)/signup/page.tsx

**Notes / gotchas**
- `redirect()` throws `NEXT_REDIRECT`; both actions call it **outside** the
  try/catch so the lookup catch can't swallow the redirect.
- `accountNotFoundTitle` / `accountNotFoundDescription` message keys are now
  unused (left in place, harmless). The `accountNotFound` error key is still used
  by `setNewPassword`.

---

## 2026-06-20 — Email + password auth and admin password reset
**Plan item:** Auth rework / Phase 1.4   **Status:** done (local verify clean; live migration/wipe pending)

**What changed**
- Added password auth as the default mode: `NEXT_PUBLIC_AUTH_MODE` now supports
  `password | phone | otp`, with unset/default resolving to `password`.
- Added `/signup` for email + password account creation. The server action uses
  the service-role admin client with `email_confirm: true`, signs in through the
  cookie-bound server client, then redirects to the existing onboarding flow.
- Replaced default `/login` with an email-first password flow. Known normal
  accounts enter their password; accounts flagged for reset set a new password;
  unknown emails link to signup. Legacy phone and OTP forms still render behind
  explicit auth-mode flags.
- Added `0011_password_reset.sql` with `profiles.password_reset_pending` and an
  explicit revoke so members cannot set the reset flag.
- Added `/admin/users`: admin-only auth-user list joined to profiles, search by
  name/email, pending-reset badge, and a reset action that marks the profile
  pending and scrambles the old password.
- Added owner email auto-promotion (`ahmed.mohamed.xx420@gmail.com`) alongside
  the existing legacy phone promotion, including the shared `getProfile()` heal
  path and onboarding action.
- Updated English/Arabic auth/admin messages, env/setup docs, Supabase migration
  docs, and project context/build plan.

**Why**
- The day-to-day app should use email + password without OTP. Password recovery is
  deliberately admin-managed for this private family app: no reset email, no code,
  just an admin-set pending state and a new-password claim on next login.

**Files touched**
- supabase/migrations/0011_password_reset.sql
- src/lib/auth/{mode.ts,phone-admin.ts,password-policy.ts}
- src/lib/profile.ts
- src/app/[locale]/(auth)/signup/*
- src/app/[locale]/(auth)/login/{page.tsx,password-actions.ts,password-login-form.tsx}
- src/app/[locale]/(auth)/onboarding/actions.ts
- src/app/[locale]/(app)/admin/{admin-nav.tsx,users/*}
- messages/en.json, messages/ar.json
- .env.example, README.md, supabase/README.md
- docs/PROJECT-CONTEXT.md, docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- Live DB still needs `0011_password_reset.sql` applied before admin reset works
  against Supabase.
- I did **not** run `delete from auth.users;`. The plan calls for explicit
  go-ahead before the destructive fresh-start wipe; that remains an owner action.
- The reset flow does not revoke already-live sessions; the plan explicitly left
  hard session revocation out of scope.
- Verified with `npm run lint` and `npm run build`.

---

## 2026-06-20 — Leaderboard scoring banner (how points work, at the top)
**Plan item:** Scoring explainer (extend to leaderboard)   **Status:** done (local verify clean)

**What changed**
- Added a **"How points work"** card at the top of the leaderboard
  ([leaderboard/page.tsx](../src/app/[locale]/(app)/leaderboard/page.tsx)), above
  the board/hall-of-fame/my-results tabs so it shows on every tab. It pairs the
  reusable **`<ScoringStrip>`** (the 7 / 4 / 2 / 0 visual with a per-tier icon and
  label) with the `scoring.footnote` line explaining that tiers are checked
  top-to-bottom and never stack.
- Lifted `getAppSettings()` into the page's top-level `Promise.all` (added a
  `scoring` translations fetch too) so the point values are available for the
  always-shown banner; the `my-results` branch now reuses that one fetch instead
  of re-querying. Dropped the now-unused `AppSettings` import and the redundant
  `appSettings != null` guard.

**Why**
- The leaderboard rows show tier *counts* (exact / goal-diff / winner / miss) and a
  total, but nothing on that page said what those tiers are worth or how they're
  earned. The owner asked for the explainer + an icon visual right at the top, so a
  newcomer reading the board understands the numbers without leaving the page.

**Files touched**
- src/app/[locale]/(app)/leaderboard/page.tsx
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- Reused the existing `<ScoringStrip>` and the `scoring` i18n namespace — no new
  component or strings. Values still come from `app_settings`; the DB
  `score_match()` trigger remains the source of truth for `points_awarded`.

---

## 2026-06-20 — Scoring explainers live: predict disclosure, results tier badges
**Plan item:** Scoring explainer (promote chosen variants)   **Status:** done (local verify clean)

**What changed**
- Promoted the design-tab **disclosure + strip** options into real member UI:
  - **`<ScoringDisclosure>`** — a collapsible "How points work" card under the
    predict form ([fixtures/[id]/page.tsx](../src/app/[locale]/(app)/fixtures/[id]/page.tsx)),
    shown for predictable (non-finished, non-TBD) matches.
  - **`<ScoringStrip>`** — the compact 7 / 4 / 2 / 0 key added to the results
    breakdown header, right under the player's stat chips.
- Redesigned each scored result row so it shows **how** the points were earned:
  a colour-coded **tier badge** (Exact / Right margin / Right winner / Miss) with
  its icon and the awarded points, replacing the old plain "Points" tile. The row
  now reads prediction → actual → outcome.
- New `src/lib/scoring.ts` (`scoreTier()` + `tierPoints()`) derives the tier from
  a prediction vs. the real result, mirroring PROJECT-CONTEXT §5 (signed goal
  difference). Display-only — the DB `score_match()` trigger is still the source of
  truth for `points_awarded`.
- Shared tier visuals in `src/components/scoring-tiers.ts` (icon + colour per tier)
  so the legend and the row badges never drift; reusable legend in
  `src/components/scoring-legend.tsx`.
- Added the `scoring` i18n namespace (tier titles/blurbs + footnote) to `en.json`
  and `ar.json`.
- `ResultsBreakdown` now takes the full `settings: AppSettings` (was `exactPoints`);
  both call sites updated.

**Why**
- Scoring was previously explained **nowhere** in the member UI, and the results
  page showed tier *counts* with no point values or definitions. This makes "why
  did I get N points on this match" obvious at the point of prediction and on the
  player card. The owner chose the disclosure + strip layouts from the rev-32
  design-tab exploration.

**Files touched**
- src/lib/scoring.ts (new)
- src/components/scoring-tiers.ts (new)
- src/components/scoring-legend.tsx (new)
- src/components/results-breakdown.tsx (strip + per-row tier badge; settings prop)
- src/app/[locale]/(app)/fixtures/[id]/page.tsx (disclosure + getAppSettings)
- src/app/[locale]/(app)/leaderboard/page.tsx (pass settings)
- src/app/[locale]/(app)/leaderboard/[userId]/page.tsx (pass settings)
- messages/en.json, messages/ar.json (`scoring` namespace)
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- The tier badge derives its label from `scoreTier()` but shows the real
  `points_awarded` from the DB, so a future settings change can't desync the label
  from the stored points. A "miss" row reads "Miss · 0 pts".
- The five design-tab variants remain at `/design-system` (`#scoring`) for
  reference; only the disclosure + strip were promoted.
- Still TODO: an authenticated mobile + RTL visual pass (the new UI is behind auth,
  so it wasn't screenshot-verified — only `npm run build` + `npm run lint`).

## 2026-06-20 — Scoring-explainer variants in the design tab
**Plan item:** Scoring explainer exploration   **Status:** done (local verify clean)

**What changed**
- Added a new **Scoring** section to the design tab (`/design-system`, anchor
  `#scoring`, kicker "13") presenting **five** layouts for teaching how points are
  awarded, so the owner can pick a favourite before it becomes a real component:
  - **A · Tiered ladder** — color-coded rows (lime/gold/emerald/muted), point pill
    per tier, plus a "first match wins, points never stack" footnote.
  - **B · By example** — one real result (`2-1`) with four sample predictions
    mapped to their tier and points.
  - **C · Collapsible disclosure** — smallest footprint for the predict page
    (interactive open/close).
  - **D · Stat cards** — 2-up cards, big number first, top accent bar.
  - **E · Compact strip** — four-segment horizontal bar to sit under the steppers.
- Copy reframes the jargon for a casual family audience: "Goal diff" → **Right
  margin**, "Winner" → **Right winner**.
- Bumped the Atmosphere section kicker from 13 → 14; registered the new section in
  the sidebar nav and render order.

**Why**
- The app currently explains scoring **nowhere** in the member UI — the rules only
  live in `app_settings` + the docs, and the results page shows tier *counts* with
  no point values or definitions. This explores the visual options first (per
  owner request to build them in the design tab) before committing one to the
  live predict/results flow.

**Files touched**
- src/app/[locale]/design-system/sections/scoring.tsx (new)
- src/app/[locale]/design-system/design-system.tsx (import, nav link, render)
- src/app/[locale]/design-system/sections/football-motion.tsx (kicker 13 → 14)
- src/app/[locale]/design-system/ds.css (`.ds-score-*` styles)
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- Design-tab only: sample data, no `app_settings` read, no member-facing route
  changed. The chosen variant still needs to be promoted to a reusable
  `<ScoringLegend>` that reads live point values and added to the predict page
  (and reused as the results-breakdown legend), with `ar`/`en` strings.
- Tier tones are driven by `--tier` / `--tier-ink` / `--tier-soft` CSS vars set
  once per parent, so all five variants share one palette.

## 2026-06-20 — Fixtures Ongoing tab and single flags
**Plan item:** 3.1 Fixtures list follow-up   **Status:** done (local verify clean)

**What changed**
- Added a member-facing **Ongoing** tab on `/fixtures`, shown only when live
  matches exist. The default landing tab remains Upcoming.
- Upcoming now lists only not-yet-started matches from the next 24h batch; live
  matches render only on Ongoing as the existing stadium hero banners, removing
  the previous top/bottom duplication.
- Added `sideLabel()` next to `sideName()` and switched member fixtures list/detail
  views to it where flags are already rendered separately.
- Updated project docs so the product context matches the new Ongoing-tab behavior.

**Why**
- Live fixtures needed a dedicated home, and member rows/banners were showing the
  same flag twice because `sideName()` embeds flags while the refreshed UI also
  renders flag elements.

**Files touched**
- `src/app/[locale]/(app)/fixtures/page.tsx`
- `src/app/[locale]/(app)/fixtures/[id]/page.tsx`
- `src/lib/match-format.ts`
- `docs/PROJECT-CONTEXT.md`, `docs/BUILD-PLAN.md`, `docs/CHANGELOG.md`

**Notes / gotchas**
- `sideName()` still returns `flag + English name` and remains the right helper
  for admin fixtures/results and the results breakdown, which do not render
  separate flag elements.
- No DB/schema/RLS changes and no new translation keys.
- Verified with `npm run lint` and `npm run build`.

## 2026-06-18 — Adopt the design-tab football language app-wide (UI refresh)
**Plan item:** 5.1 UX polish (follow-up)   **Status:** done (local verify clean)

**What changed**
- **Tokens (`globals.css`):** promoted the design-tab palette into the real shadcn
  tokens. `--primary` deepened toward pitch-emerald; added named `--lime`
  (energy / primary-CTA / live / active, charcoal text) and `--gold` (points /
  achievements, charcoal text) registered in `@theme inline` so `bg-lime`,
  `text-gold`, etc. generate. Added `--gradient-pitch/-lime/-gold`,
  `--shadow-lime/-gold`, a faint lime stadium-wash `body` background (light +
  dark), and bumped `--radius` to `0.75rem`.
- **Motion (CSS-only, no new dependency):** ported the kit keyframes (ball spin/
  bounce/shadow, float, grass, floodlight, momentum sweep, confetti, goal ring,
  trophy halo/shine) into `globals.css` as `wc-*`, all behind one
  `prefers-reduced-motion` guard (confetti + ring render nothing, not just paused).
- **New shared components:** `ui/soccer-ball.tsx` (SVG), `ball-loader.tsx`
  (replaces `Loader2` in predict form, avatar upload, sync, and all auth/profile
  submit buttons), `goal-burst.tsx`, `momentum-bar.tsx`, `match-banner.tsx`.
  Added a `lime` variant to `ui/button.tsx`.
- **Screens:** fixtures list → elevated cards + flag chips + gold result chip +
  segmented tabs + a pitch-gradient "next match" hero with a lime Predict CTA;
  match detail → `MatchBanner` hero, a real privacy-safe "family lean" momentum
  bar for live matches (home-win vs away-win share of already-revealed picks), a
  one-off `GoalBurst` when the viewer's exact score was correct, restyled steppers
  (lime `+`) and gold points in the reveal; leaderboard → top-3 medal ranks,
  category-colored stat pills, segmented tabs; Hall of Fame → gold value badges +
  shine on awarded icons; results breakdown → pitch-gradient profile band, lime/
  gold form dots, gold points tiles; profile/onboarding/login/avatar/admin-sync →
  lime CTAs + ball loaders + status dots.
- Added i18n keys `predict.leanTitle/leanCaption/celebrateWord/celebrateExact`
  (en + ar).

**Why**
- The design tab (`/design-system`) was a polished but isolated visual language;
  the live app was much plainer. Owner asked to bring that identity + tasteful
  motion into the real screens (full re-theme, all screens, CSS-only motion).

**Files touched**
- `src/app/globals.css`, `src/components/ui/button.tsx`
- new: `src/components/ui/soccer-ball.tsx`, `src/components/ball-loader.tsx`,
  `src/components/goal-burst.tsx`, `src/components/momentum-bar.tsx`,
  `src/components/match-banner.tsx`
- `src/components/{bottom-nav,hall-of-fame,results-breakdown,avatar-upload}.tsx`
- `src/app/[locale]/(app)/layout.tsx`, `.../fixtures/page.tsx`,
  `.../fixtures/[id]/page.tsx`, `.../fixtures/[id]/predict-form.tsx`,
  `.../leaderboard/page.tsx`, `.../profile/page.tsx`, `.../profile/profile-form.tsx`,
  `.../admin/sync/page.tsx`, `.../admin/sync/sync-buttons.tsx`
- `src/app/[locale]/(auth)/onboarding/onboarding-form.tsx`,
  `.../(auth)/login/login-form.tsx`, `.../(auth)/login/phone-login-form.tsx`
- `messages/en.json`, `messages/ar.json`

**Notes / gotchas**
- No DB/RLS/API/schema changes; privacy gating untouched — the live "family lean"
  bar and reveal only restyle already-visible (post-kickoff) prediction rows.
- Decided **not** to build the SVG team-kit/jersey component: teams have a `flag`
  emoji + `code` but no per-team colours in the DB, so inventing colours would be
  fake data. Flag emojis are used in banners/rows instead.
- `LiveBadge` kept red (universal "live" cue) so lime stays reserved for
  energy/active/CTA.
- Verified: `npm run lint` + `npm run build` clean; dev server renders `/en/login`
  and `/ar/login` (dir="rtl") at HTTP 200; all `wc-*` keyframes, gradient/shadow
  utilities, and the `prefers-reduced-motion` block confirmed present in the
  production CSS. An authed mobile walk of fixtures/leaderboard still needs a real
  login session.

## 2026-06-18 — Dual-accent palette for the design tab (green / gold + lime spark)
**Plan item:** Design-tab addition (rev 29)   **Status:** done

**What changed**
- Reworked the design-tab palette into a meaning-based dual-accent system, all
  via the `.ds-root` token block in `ds.css` (no structural/layout changes):
  - **Base** — slightly deepened emerald "pitch" green (`--ds-emerald-950/850/700`
    → `#0a3a2b / #14533c / #1d6f50`; `--ds-gradient` end → `#2c7a48`).
  - **Energy accent (kept)** — neon lime stays the signature spark and is left in
    place everywhere it already was: buttons, hero, charts, live badge, momentum
    fill/sweep, goal-burst ring, ticker.
  - **Achievement accent (new)** — championship gold tokens `--ds-gold-400 #f4c54a`,
    `--ds-gold-500 #e0a92e`, `--ds-gold-700 #8a6512`, `--ds-gold-gradient`, and
    `--ds-shadow-gold`.
- Routed only genuine "achievement" surfaces to gold: the champion trophy card
  (icon now tokenized) + its badge, Hall of Fame award icon + value badges, the
  knockout `ds-champion` block, the winning result tile, the leaderboard rank-#1
  medal (new `is-gold` modifier), the points-earned goal badge, and the leading
  shootout score (`is-lead`).
- Added a `gold` `DsBadge` tone (`components.tsx` + `.ds-badge--gold`).
- Updated the Colors section to document the emerald/lime/gold roles accurately.

**Why**
- Owner asked how to make the palette fitting for the football/World Cup theme
  while keeping the unique style. Chosen direction (via prompt): "Green / Gold +
  lime spark" — keep the emerald pitch base and lime energy signature, add gold
  for trophy/winner/achievement states. Gold also nods to the real WC2026
  black/white/gold brand identity. Lime was deliberately NOT globally replaced, so
  the existing personality is preserved.

**Files touched**
- src/app/[locale]/design-system/ds.css
- src/app/[locale]/design-system/components.tsx
- src/app/[locale]/design-system/sections/colors.tsx
- src/app/[locale]/design-system/sections/world-cup.tsx
- src/app/[locale]/design-system/sections/football-motion.tsx
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- Design-tab only; no production screens, APIs, schema, or translations changed.
- Verified with `npm run lint` + `npm run build` (both clean).
- The semantic split is the contract going forward: **lime = live/energy**,
  **gold = achievement/winner**. Reuse the tokens, don't reintroduce raw hexes.

## 2026-06-18 — Atmosphere & Motion section in the design tab
**Plan item:** Design-tab addition (rev 28)   **Status:** done

**What changed**
- Added `src/app/[locale]/design-system/sections/football-motion.tsx`, a new
  design-system-only section ("Atmosphere & Motion") with football-themed motion
  and imagery, all self-contained CSS/SVG (no external image files):
  - a living **stadium banner** (drifting mowed-grass stripes, sweeping
    floodlight glow, goal-net mesh, floating + spinning ball, live score);
  - **ball loaders** — an inline SVG black-and-white panel ball with spin,
    bounce (with shadow), inline, and a rolling-progress-strip variant;
  - **live momentum** — an animated possession bar with a moving sheen and a
    scrolling commentary ticker;
  - **moment cards** — a GOAL! burst with an expanding ring + CSS confetti, and a
    champion **trophy** card with a gold halo/shine sweep + confetti (gold nods to
    the real WC2026 black/white/gold brand identity);
  - a **penalty-shootout tracker** (pop-in goal/miss/pending marks) and **SVG
    team-kit swatches** derived from each team's colours.
- Appended ~620 lines of matching styles + keyframes to `ds.css`, all under the
  existing `.ds-root` scope and emerald/lime tokens, with a
  `prefers-reduced-motion` block that disables every new animation.
- Wired the section into `design-system.tsx` (sidebar link "Atmosphere" + render
  after the World Cup section).

**Why**
- The owner asked to expand the design tab with football/World Cup design
  elements — animations and imagery. Built as self-contained CSS/SVG (rather than
  fetched binary assets) to keep the kit offline, dependency-free, and
  theme-consistent with the rest of the design tab, which uses zero external
  images. Web research informed the visual cues (WC2026 trophy + gold accent).

**Files touched**
- src/app/[locale]/design-system/sections/football-motion.tsx (new)
- src/app/[locale]/design-system/design-system.tsx
- src/app/[locale]/design-system/ds.css
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- Sample data only; no production screens, APIs, schema, or translations changed.
- Verified with `npm run lint` + `npm run build` (both clean).
- The inline `SoccerBall` SVG reuses fixed `defs` ids (`dsBallShine`,
  `dsBallClip`) across instances; renders fine (all refs resolve to the first def)
  but if these visuals are ever promoted into a production screen, scope the ids.

## 2026-06-18 — World Cup patterns in the design tab
**Plan item:** Design-tab addition (rev 27)   **Status:** done

**What changed**
- Added `src/app/[locale]/design-system/sections/world-cup.tsx`, a new
  design-system-only section ("World Cup Patterns") rebuilding the app's
  football-specific UI in the standalone design-tab theme: fixture rows for
  upcoming / live / finished / TBD states, score-prediction steppers with
  saved/saving/locked/error status pills, a revealed-prediction list with the
  current user highlighted, leaderboard rows, stat chips + form dots, result
  breakdown tiles, Hall of Fame award cards, and avatar-upload / phone sign-in /
  admin-result / admin-fixture / sync-log mocks.
- Wired the section into `design-system.tsx` (sidebar link + render after Layouts).
- Updated the Icons section to football-relevant Lucide icons (Trophy, Goal,
  Target, Shield, Flame, CalendarDays, ListChecks, Clock3, TrendingUp, ...).
- Added scoped `ds-*` classes (all under `.ds-root`) to `ds.css` for the new
  patterns, plus a 4-up award grid at the wide breakpoint.
- Added stronger World Cup identity to the same section: a "Matchday" hero card
  with a CSS football-pitch motif (centre line + centre circle), team flags, a
  glassy kickoff countdown, and a Predict CTA; a Group H standings table with
  qualification highlighting; a knockout bracket (QF -> SF -> Final) ending in a
  lime champion chip; and flag emoji on the fixture rows (TBD sides show a neutral
  "?" token). All emoji/CSS only — no image assets.

**Why**
- The design tab lacked the app-specific patterns, so it couldn't be used as a
  visual reference for the real product surfaces. This recreates them with sample
  data without touching any live screen.

**Files touched**
- src/app/[locale]/design-system/sections/world-cup.tsx (new)
- src/app/[locale]/design-system/design-system.tsx
- src/app/[locale]/design-system/sections/icons.tsx
- src/app/[locale]/design-system/ds.css

**Notes / gotchas**
- Sample-data only and deliberately not labelled as a real World Cup 2026
  schedule/venues/results. No production APIs, DB schema, routes, translations,
  or shared app components changed.
- Verified with `npm run lint` and `npm run build` (both clean); `/design-system`
  still prerenders for `/en` and `/ar`.

## 2026-06-18 — Avatar save race fix
**Plan item:** 1.2 Step 2 avatar upload follow-up   **Status:** done

**What changed**
- Profile and onboarding forms now track whether the avatar upload is still
  running and disable their Save/Finish button until the upload completes.
- The submit button text switches to "Uploading photo..." while waiting, and the
  uploader shows a small "Photo ready. Save changes to keep it." hint after a
  newly uploaded image.
- Confirmed the live Supabase project has the `avatars` bucket configured.

**Why**
- A member could pick a photo and click Save before the upload finished. That
  submitted the previous hidden `avatarUrl` value, so the visible preview changed
  but `profiles.avatar_url` did not persist the new photo.

**Files touched**
- src/components/avatar-upload.tsx
- src/app/[locale]/(app)/profile/profile-form.tsx
- src/app/[locale]/(auth)/onboarding/onboarding-form.tsx
- messages/ar.json, messages/en.json
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- Verification: message JSON parse, `npm run lint`, and `npm run build` pass.

## 2026-06-18 — Profile avatars
**Plan item:** 1.2 Step 2 avatar upload follow-up   **Status:** repo code done; live `0010` apply pending

**What changed**
- Added `0010_avatars_storage.sql`, creating a public `avatars` bucket with
  authenticated reads and own-folder insert/update/delete policies.
- Added a reusable `Avatar` primitive and `AvatarUpload` client component. The
  uploader crops/compresses images in-browser to a 512px square, uploads to the
  stable object path `{user_id}/avatar.webp`, and cache-busts the saved public
  URL.
- Wired onboarding and profile forms to submit `avatar_url`; server actions
  validate that the submitted URL belongs to the signed-in user's own avatar
  object. Profile removal clears `profiles.avatar_url` and attempts to delete the
  stable storage object.
- Replaced initials-only bubbles with image + initials fallback across
  leaderboard rows, Hall of Fame holders, result breakdown player headers, and
  fixture prediction reveals.
- Added Arabic/English uploader strings.

**Why**
- Members should be able to optionally personalize their profile during setup or
  later from Profile, and that identity should follow them wherever members
  appear while still falling back cleanly to initials.

**Files touched**
- supabase/migrations/0010_avatars_storage.sql
- src/components/avatar-upload.tsx, src/components/ui/avatar.tsx
- src/lib/avatar-url.ts, src/lib/hall-of-fame.ts
- src/app/[locale]/(auth)/onboarding/actions.ts
- src/app/[locale]/(auth)/onboarding/onboarding-form.tsx
- src/app/[locale]/(app)/profile/actions.ts
- src/app/[locale]/(app)/profile/profile-form.tsx
- src/app/[locale]/(app)/profile/page.tsx
- src/app/[locale]/(app)/leaderboard/page.tsx
- src/app/[locale]/(app)/fixtures/[id]/page.tsx
- src/components/hall-of-fame.tsx, src/components/results-breakdown.tsx
- messages/ar.json, messages/en.json
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- Owner must apply `supabase/migrations/0010_avatars_storage.sql` in Supabase
  before live uploads work.
- Existing aggregate RPCs already return `avatar_url`, so no leaderboard/member
  stats migration changes were needed.
- Verification: message JSON parse, `npm run lint`, and `npm run build` pass.

## 2026-06-18 — Leaderboard Hall of Fame stats
**Plan item:** 4.4 Hall of Fame stats + player cards   **Status:** in progress (repo code done; live `0009` apply pending)

**What changed**
- Added `0009_member_stats.sql`, an aggregate-only `get_member_stats()` RPC for
  per-profile totals, tier counts, exact-points setting, streaks, last-5 points,
  average predicted goals, and average prediction lead time.
- Added pure Hall of Fame and player-stat helpers, plus an `app_settings` reader
  so exact-score thresholds still come from the database.
- Added the Leaderboard third tab (Board / Hall of Fame / My results), 8 award
  cards, and a compact per-player stats strip on result breakdown pages.
- Added the shadcn Badge primitive and synchronized Arabic/English messages.
- Updated project docs to move this out of deferred advanced analytics and record
  the aggregate privacy stance.
- Added a friendly setup-pending state when the app is running before `0009` has
  been applied, instead of surfacing the raw `PGRST202` server error.

**Why**
- The owner wanted playful family engagement without exposing hidden pre-kickoff
  prediction rows. Public cross-user data stays aggregate-only; selected member
  breakdowns still use normal RLS-filtered prediction reads.

**Files touched**
- supabase/migrations/0009_member_stats.sql
- src/lib/leaderboard.ts, src/lib/hall-of-fame.ts, src/lib/app-settings.ts
- src/components/hall-of-fame.tsx, src/components/results-breakdown.tsx
- src/components/ui/badge.tsx
- src/app/[locale]/(app)/leaderboard/page.tsx
- src/app/[locale]/(app)/leaderboard/[userId]/page.tsx
- messages/ar.json, messages/en.json
- docs/BUILD-PLAN.md, docs/PROJECT-CONTEXT.md, docs/CHANGELOG.md

**Notes / gotchas**
- Owner must apply `supabase/migrations/0009_member_stats.sql` in Supabase before
  the Hall of Fame tab can fetch live data.
- Privacy check: `get_member_stats()` returns aggregate rows only. It has no
  prediction ids, match ids, individual scorelines, or row-level timestamps.
- Verification: message JSON parse, `npm run lint`, and `npm run build` pass.
  Live-smoke the migration after applying `0009`.

## 2026-06-18 — Admin phone live profile promotion + variants
**Plan item:** Auth/admin bugfix   **Status:** done

**What changed**
- Hardened admin-phone matching to recognize the same Saudi number as
  `966595440204`, `9660595440204`, `0595440204`, or `595440204`.
- Checked the live Supabase project using the service-role key and found
  `966595440204@phone.local` with an existing profile that was not admin.
- Updated that live profile to `is_admin = true`.

**Why**
- The phone account existed before the latest promotion path ran, so the profile
  remained non-admin. Older login UI variants could also create different
  synthetic accounts for the same real phone number.

**Files touched**
- src/lib/auth/phone-admin.ts
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- Live data was changed intentionally: `966595440204@phone.local` was promoted.
- After production deploy, the variant matching prevents the same issue for
  common local-number forms of this Saudi number.

## 2026-06-18 — Admin phone promotion for existing sessions
**Plan item:** Auth/admin bugfix   **Status:** done

**What changed**
- `getProfile()` now recognizes the allow-listed phone account and promotes its
  profile to `is_admin = true` if the row still says false.
- The returned profile is treated as admin in the same request after the
  successful promotion, so the Admin nav/layout can unlock without another
  sign-in round-trip.

**Why**
- The first admin-phone implementation only ran during phone login or onboarding.
  If the phone account was already signed in before the deploy, those server
  actions would not run again, so the profile stayed non-admin.

**Files touched**
- src/lib/profile.ts
- docs/BUILD-PLAN.md, docs/CHANGELOG.md

**Notes / gotchas**
- A production deploy is still required. After deploy, refresh the app while
  signed into `+966595440204`; if the old page was cached in the browser, sign
  out and back in once.

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
