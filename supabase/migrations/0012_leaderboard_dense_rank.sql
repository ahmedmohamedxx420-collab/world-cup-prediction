-- Phase 4 follow-up -- dense leaderboard ranking.
-- Swaps rank() (competition ranking: 1, 1, 3 with a skipped 2) for dense_rank()
-- (1, 1, 2) so genuinely tied players share a rank without leaving a gap. Without
-- this, two players tied on both total_points and exact_count read as 1st/1st/3rd
-- and the podium's silver medal never appears.
-- Only the window function changes; the body otherwise matches 0008_leaderboard.sql.
-- Apply after 0008_leaderboard.sql.

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
    (dense_rank() over (order by total_points desc, exact_count desc))::integer as rank
  from agg
  order by total_points desc, exact_count desc, full_name asc;
$$;

grant execute on function public.get_leaderboard() to authenticated;
