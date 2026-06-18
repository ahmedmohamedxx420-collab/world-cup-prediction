-- Phase 4.4 -- aggregate member stats for Hall of Fame badges.
-- SECURITY DEFINER mirrors get_leaderboard(): it can aggregate every member's
-- predictions while returning aggregate rows only, never individual picks.
-- Apply after 0008_leaderboard.sql.

create or replace function public.get_member_stats()
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  total_points integer,
  scored_count integer,
  exact_count integer,
  gd_count integer,
  winner_count integer,
  miss_count integer,
  exact_points integer,
  longest_scoring_streak integer,
  last5_points integer,
  avg_goals_x100 integer,
  avg_lead_seconds integer
)
language sql
security definer
set search_path = public
stable
as $$
  with s as (
    select exact_points, goal_diff_points, winner_points
    from public.app_settings
    where id = 1
  ),
  base as (
    select
      pr.id as user_id,
      pr.full_name,
      pr.avatar_url,
      s.exact_points,
      s.goal_diff_points,
      s.winner_points
    from public.profiles pr
    cross join s
  ),
  agg as (
    select
      b.user_id,
      b.full_name,
      b.avatar_url,
      coalesce(sum(p.points_awarded), 0)::integer as total_points,
      count(p.points_awarded)::integer as scored_count,
      count(*) filter (where p.points_awarded = b.exact_points)::integer as exact_count,
      count(*) filter (where p.points_awarded = b.goal_diff_points)::integer as gd_count,
      count(*) filter (where p.points_awarded = b.winner_points)::integer as winner_count,
      count(*) filter (where p.points_awarded = 0)::integer as miss_count,
      b.exact_points,
      round(avg((p.home_score + p.away_score)::numeric) * 100)::integer as avg_goals_x100,
      round(
        avg(extract(epoch from (m.kickoff_at - p.created_at)))
          filter (where p.created_at < m.kickoff_at)
      )::integer as avg_lead_seconds
    from base b
    left join public.predictions p on p.user_id = b.user_id
    left join public.matches m on m.id = p.match_id
    group by
      b.user_id,
      b.full_name,
      b.avatar_url,
      b.exact_points,
      b.goal_diff_points,
      b.winner_points
  ),
  scored_order as (
    select
      p.user_id,
      p.points_awarded,
      row_number() over (
        partition by p.user_id
        order by m.match_number nulls last, m.kickoff_at, p.match_id
      ) as rn_all,
      row_number() over (
        partition by p.user_id
        order by m.kickoff_at desc, m.match_number desc nulls last, p.match_id desc
      ) as rn_recent
    from public.predictions p
    join public.matches m on m.id = p.match_id
    where p.points_awarded is not null
  ),
  scoring_only as (
    select
      so.*,
      row_number() over (
        partition by so.user_id
        order by so.rn_all
      ) as rn_hit
    from scored_order so
    where so.points_awarded > 0
  ),
  streak_runs as (
    select
      user_id,
      count(*)::integer as run_length
    from scoring_only
    group by user_id, rn_all - rn_hit
  ),
  streaks as (
    select
      user_id,
      coalesce(max(run_length), 0)::integer as longest_scoring_streak
    from streak_runs
    group by user_id
  ),
  last5 as (
    select
      user_id,
      coalesce(sum(points_awarded) filter (where rn_recent <= 5), 0)::integer as last5_points
    from scored_order
    group by user_id
  )
  select
    agg.user_id,
    agg.full_name,
    agg.avatar_url,
    agg.total_points,
    agg.scored_count,
    agg.exact_count,
    agg.gd_count,
    agg.winner_count,
    agg.miss_count,
    agg.exact_points,
    coalesce(streaks.longest_scoring_streak, 0)::integer as longest_scoring_streak,
    coalesce(last5.last5_points, 0)::integer as last5_points,
    agg.avg_goals_x100,
    agg.avg_lead_seconds
  from agg
  left join streaks on streaks.user_id = agg.user_id
  left join last5 on last5.user_id = agg.user_id
  order by agg.total_points desc, agg.full_name asc;
$$;

grant execute on function public.get_member_stats() to authenticated;

select pg_notify('pgrst', 'reload schema');
