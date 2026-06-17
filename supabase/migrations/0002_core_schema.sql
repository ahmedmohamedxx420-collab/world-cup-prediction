-- Phase 2.1 — core schema: teams, matches, predictions, app_settings.
-- Apply after 0001_profiles.sql, before 0003_core_rls.sql.
--
-- This file creates structure only and enables RLS on every table so they are
-- locked by default (RLS with no policy = deny-all to anon/authenticated). The
-- access policies, the is_admin() helper, and the member column grants are added
-- in 0003_core_rls.sql. Prediction privacy is enforced there, in the database —
-- never the UI alone (PROJECT-CONTEXT.md §7).

-- Shared updated_at trigger -------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- teams ---------------------------------------------------------------------
create table public.teams (
  id integer generated always as identity primary key,
  name_en text not null,
  name_ar text not null,
  code text not null unique,            -- FIFA 3-letter code; seed joins on this
  flag text,                            -- emoji or asset key
  group_letter text                     -- A–L (2026 has 12 groups)
);

alter table public.teams enable row level security;

-- matches -------------------------------------------------------------------
create table public.matches (
  id integer generated always as identity primary key,
  match_number integer unique,          -- official FIFA match # (1–104)
  stage text not null check (
    stage in ('group','round_32','round_16','quarter','semi','third_place','final')
  ),
  group_letter text,
  home_team_id integer references public.teams(id),  -- null while a knockout slot is TBD
  away_team_id integer references public.teams(id),
  home_label text,                      -- e.g. "Winner Group A" before teams are known
  away_label text,
  kickoff_at timestamptz not null,      -- stored UTC; predictions close at this instant
  venue text,
  -- Display/scoring state only. The privacy + close-at-kickoff gate keys on
  -- kickoff_at, NEVER on status.
  status text not null default 'scheduled' check (status in ('scheduled','live','finished')),
  home_score integer,                   -- official full-time incl. extra time
  away_score integer,
  shootout_winner_team_id integer references public.teams(id),  -- display only, never scored
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index matches_kickoff_at_idx on public.matches (kickoff_at);
create index matches_stage_idx on public.matches (stage);

create trigger matches_set_updated_at
before update on public.matches
for each row execute function public.set_updated_at();

alter table public.matches enable row level security;

-- predictions ---------------------------------------------------------------
create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id integer not null references public.matches(id) on delete cascade,
  home_score integer not null check (home_score >= 0),
  away_score integer not null check (away_score >= 0),
  points_awarded integer,               -- null until the match is scored
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)            -- one prediction per user per match
);

create index predictions_match_id_idx on public.predictions (match_id);

create trigger predictions_set_updated_at
before update on public.predictions
for each row execute function public.set_updated_at();

alter table public.predictions enable row level security;

-- app_settings (singleton) --------------------------------------------------
-- Scoring numbers live here so they can be tuned without a redeploy. Never
-- hard-code them in the app (CLAUDE.md).
create table public.app_settings (
  id integer primary key default 1 check (id = 1),
  exact_points integer not null default 7,
  goal_diff_points integer not null default 4,
  winner_points integer not null default 2
);

alter table public.app_settings enable row level security;

-- Seed the singleton row with the agreed 7 / 4 / 2.
insert into public.app_settings (id) values (1);
