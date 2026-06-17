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
| `CRON_SECRET` | **server only** | Bearer secret protecting `POST /api/sync` |
| `WORLDCUP_FEED_URL` | server | *optional* — source feed override; defaults to the openfootball `worldcup.json` (free, no key, covers WC2026) |

`.env.local` is git-ignored; `.env.example` is committed as the template.

## Result sync (openfootball worldcup.json)

`POST /api/sync` (protected by `CRON_SECRET`) pulls fixtures + results from the free,
public [openfootball `worldcup.json`](https://github.com/openfootball/worldcup.json)
feed (no API key; covers all 104 matches of WC2026 and updates scores live). Final
scores flow through the scoring trigger and auto-score predictions. Trigger it
manually from the admin **Sync** tab. The committed GitHub Actions workflow calls it
twice around each match (half-time check + post-match check) and stays under the
30-pulls/day server-side cap; cron-job.org can be used instead if more punctual
scheduling is needed. Run a **Full sync** from the Sync tab once first to load the
48 teams + 104-match schedule.

## Supabase setup

Database migrations live in [`supabase/migrations/`](supabase/migrations/) and
are applied manually, in numeric order, by pasting each file into the Supabase
dashboard's **SQL Editor**. See [`supabase/README.md`](supabase/README.md) for the
workflow.

For typed email-code login, update **Auth → Emails → Magic Link** in the
Supabase dashboard so the message displays the six-digit `{{ .Token }}`. Also
confirm **Auth → Providers → Email** is enabled and email signups are on.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run lint` — ESLint
