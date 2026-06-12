# World Cup Predictions

A private, mobile-first, Arabic-first (RTL) FIFA World Cup score-prediction app
for one family group with a single shared leaderboard.

See [`docs/PROJECT-CONTEXT.md`](docs/PROJECT-CONTEXT.md) for the full spec,
[`docs/BUILD-PLAN.md`](docs/BUILD-PLAN.md) for the backlog, and
[`CLAUDE.md`](CLAUDE.md) for the working conventions.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 + shadcn/ui · next-intl
(ar default + en) · Supabase (Postgres + Auth + Storage + RLS) · Vercel.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase values
npm run dev                  # http://localhost:3000  (redirects to /ar)
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in from your Supabase project
(Dashboard → Project Settings → API):

| Variable | Where it's used | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Project URL; public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | anon/publishable key; public, RLS-bound |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | service_role/secret key; bypasses RLS — never expose |

`.env.local` is git-ignored; `.env.example` is committed as the template.

After setting the values, confirm connectivity by visiting
`/api/supabase-health` (returns `{ ok: true, connected: true }`). That route is a
temporary smoke test and will be removed once verified.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint
