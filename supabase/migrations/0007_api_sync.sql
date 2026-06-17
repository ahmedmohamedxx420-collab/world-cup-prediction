-- Phase 2.6 — API-Football sync support.
-- Adds the stable keys used to map API-Football records onto our rows (idempotent
-- upserts), plus a sync_runs log for the admin "last synced" view and the
-- daily-pull cap. Apply after 0006_scoring.sql.

alter table public.teams add column api_team_id bigint unique;
alter table public.matches add column api_fixture_id bigint unique;

-- One row per sync invocation.
create table public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('schedule', 'results')),
  ran_at timestamptz not null default now(),
  ok boolean not null,
  fixtures_upserted integer,
  error text
);

create index sync_runs_ran_at_idx on public.sync_runs (ran_at desc);

alter table public.sync_runs enable row level security;

-- Admins read the log in the UI. Writes happen via the service-role client
-- (the sync job / cron), which bypasses RLS — so no insert policy is needed.
create policy "Admins can read sync_runs"
on public.sync_runs for select to authenticated
using (public.is_admin());
