-- Phase 4 -- aggregate leaderboard.
-- SECURITY DEFINER lets the board total every member's predictions while
-- returning aggregates only. Individual prediction breakdowns still use normal
-- RLS-bound selects from the app.
-- Apply after 0006_scoring.sql.

create or replace function public.get_leaderboard()
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  total_points integer,
  predictions_made integer,
  scored_count integer,
  exact_count integer,
  gd_count integer,
  winner_count integer,
  miss_count integer,
  rank integer
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
  agg as (
    select
      pr.id as user_id,
      pr.full_name,
      pr.avatar_url,
      coalesce(sum(p.points_awarded), 0)::integer as total_points,
      count(p.id)::integer as predictions_made,
      count(p.points_awarded)::integer as scored_count,
      count(*) filter (where p.points_awarded = s.exact_points)::integer as exact_count,
      count(*) filter (where p.points_awarded = s.goal_diff_points)::integer as gd_count,
      count(*) filter (where p.points_awarded = s.winner_points)::integer as winner_count,
      count(*) filter (where p.points_awarded = 0)::integer as miss_count
    from public.profiles pr
    cross join s
    left join public.predictions p on p.user_id = pr.id
    group by pr.id, pr.full_name, pr.avatar_url
  )
  select
    agg.*,
    (rank() over (order by total_points desc, exact_count desc))::integer as rank
  from agg
  order by total_points desc, exact_count desc, full_name asc;
$$;

grant execute on function public.get_leaderboard() to authenticated;
