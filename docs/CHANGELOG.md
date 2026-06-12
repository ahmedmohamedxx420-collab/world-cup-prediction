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
