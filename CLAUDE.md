# CLAUDE.md

Guidance for any Claude session working in this repo. Keep it short; the detail
lives in `docs/`.

## What this is

A private, mobile-first **FIFA World Cup score-prediction** web app for one family
group with a single shared leaderboard. Arabic-first (RTL), English secondary.

## The documentation workflow (do this every time)

1. **Before coding:** read [`docs/PROJECT-CONTEXT.md`](docs/PROJECT-CONTEXT.md)
   (the source of truth) and [`docs/BUILD-PLAN.md`](docs/BUILD-PLAN.md)
   (the backlog + "Current Position"). Build the next unblocked item.
2. **After each coding execution:**
   - Update status markers and the **Current Position** pointer in `BUILD-PLAN.md`.
   - Append a dated entry to [`docs/CHANGELOG.md`](docs/CHANGELOG.md)
     (what changed, why, files touched, gotchas).
   - If a decision or fact changed, update `PROJECT-CONTEXT.md` too.
3. Keep changes **small and verifiable** — one plan item at a time.

## Tech stack

Next.js (App Router) + TypeScript · Tailwind CSS + shadcn/ui · Supabase
(Postgres + email-OTP Auth + Storage + RLS) · next-intl · deployed on Vercel.

## Non-negotiable conventions

- **Privacy is enforced in RLS, not just the UI.** Predictions are hidden until
  `now() >= matches.kickoff_at`. The DB is the gate; the UI must not be the only
  thing hiding data. (PROJECT-CONTEXT.md §7)
- **RTL-safe styling:** use Tailwind **logical** properties (`ps-`/`pe-`,
  `ms-`/`me-`, `text-start`/`text-end`) — never `pl-`/`pr-`/`left`/`right`.
  Arabic is the default locale.
- **Mobile-first**, then scale to desktop.
- **Scoring numbers come from `app_settings`** (exact 7 / goal-diff 4 / winner 2),
  not hard-coded. Goal difference is **signed**. (PROJECT-CONTEXT.md §5)
- Kickoff times are stored in **UTC**; displayed in the user's local time.
- Match data is entered **manually** by the admin in v1; keep the schema
  API-ready but don't add an external API without being asked.

## Commands

Package manager: **npm**. Node 22.

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build (Turbopack); run this to verify a change
- `npm run lint` — ESLint

Stack notes: Next 16 (App Router) · React 19 · **Tailwind v4** (CSS-first config in
`src/app/globals.css` — no `tailwind.config.js`) · **shadcn/ui** (RTL on; add
components with `npx shadcn@latest add <name>`) · UI font **Tajawal** (`--font-sans`).
