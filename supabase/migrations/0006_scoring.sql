-- Phase 2.5 — scoring. Setting a match's final score marks it finished and
-- (re)computes points for every prediction on that match, per PROJECT-CONTEXT
-- §5: exact = exact_points; correct SIGNED goal-difference = goal_diff_points;
-- correct winner/tendency = winner_points; otherwise 0. Numbers come from
-- app_settings (never hard-coded). Clearing the score resets points to null.
-- Idempotent: re-entering a corrected score recomputes cleanly.
-- Apply after 0002_core_schema.sql + 0003_core_rls.sql.

-- score_match(): recompute points_awarded for all predictions of one match.
-- SECURITY DEFINER so it can read app_settings and write every user's
-- predictions.points_awarded regardless of RLS / the member column grants.
create or replace function public.score_match(p_match_id integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  s record;
begin
  select home_score, away_score into m
  from public.matches
  where id = p_match_id;

  if not found then
    return;
  end if;

  -- No final score yet (or it was cleared): predictions are unscored.
  if m.home_score is null or m.away_score is null then
    update public.predictions
    set points_awarded = null
    where match_id = p_match_id
      and points_awarded is not null;
    return;
  end if;

  select exact_points, goal_diff_points, winner_points into s
  from public.app_settings
  where id = 1;

  -- Tiers are evaluated top-down; the first match wins. Goal difference is
  -- signed, so it implies the correct tendency.
  update public.predictions p
  set points_awarded = case
    when p.home_score = m.home_score and p.away_score = m.away_score
      then s.exact_points
    when (p.home_score - p.away_score) = (m.home_score - m.away_score)
      then s.goal_diff_points
    when sign((p.home_score - p.away_score)::numeric)
       = sign((m.home_score - m.away_score)::numeric)
      then s.winner_points
    else 0
  end
  where p.match_id = p_match_id;
end;
$$;

-- Derive status from the scores on every score write: both present => finished;
-- clearing a finished match's scores returns it to scheduled.
create or replace function public.set_match_status_from_scores()
returns trigger
language plpgsql
as $$
begin
  if new.home_score is not null and new.away_score is not null then
    new.status := 'finished';
  elsif new.status = 'finished' then
    new.status := 'scheduled';
  end if;
  return new;
end;
$$;

create trigger matches_set_status_from_scores
before insert or update of home_score, away_score on public.matches
for each row execute function public.set_match_status_from_scores();

-- After a score change, (re)compute points for that match. Updates predictions
-- only, so it never re-fires the matches triggers.
create or replace function public.matches_rescore()
returns trigger
language plpgsql
as $$
begin
  perform public.score_match(new.id);
  return null;
end;
$$;

create trigger matches_rescore
after insert or update of home_score, away_score on public.matches
for each row execute function public.matches_rescore();
