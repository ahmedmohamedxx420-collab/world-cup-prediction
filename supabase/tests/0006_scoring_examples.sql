-- Rollback-wrapped verification for PROJECT-CONTEXT section 5 worked examples.
-- Run in the Supabase SQL editor after applying 0006_scoring.sql.
-- Expected for actual 2-1: 2-1 -> 7, 3-2 -> 4, 1-0 -> 4, 3-0 -> 2, 1-2 -> 0.

begin;

do $$
declare
  v_user_id uuid;
  v_match_id integer;
  v_actual_points integer;
  v_home_predictions integer[] := array[2, 3, 1, 3, 1];
  v_away_predictions integer[] := array[1, 2, 0, 0, 2];
  v_expected_points integer[] := array[7, 4, 4, 2, 0];
begin
  select id into v_user_id
  from public.profiles
  order by created_at asc
  limit 1;

  if v_user_id is null then
    raise exception 'Scoring examples need at least one profile row.';
  end if;

  for i in 1..array_length(v_expected_points, 1) loop
    insert into public.matches (
      stage,
      group_letter,
      home_label,
      away_label,
      kickoff_at
    )
    values (
      'group',
      'A',
      'Scoring test home',
      'Scoring test away',
      now() - interval '1 day'
    )
    returning id into v_match_id;

    insert into public.predictions (
      user_id,
      match_id,
      home_score,
      away_score
    )
    values (
      v_user_id,
      v_match_id,
      v_home_predictions[i],
      v_away_predictions[i]
    );

    update public.matches
    set home_score = 2,
        away_score = 1
    where id = v_match_id;

    select points_awarded into v_actual_points
    from public.predictions
    where user_id = v_user_id
      and match_id = v_match_id;

    if v_actual_points is distinct from v_expected_points[i] then
      raise exception 'Example % expected % points, got %.',
        i, v_expected_points[i], v_actual_points;
    end if;
  end loop;
end;
$$;

rollback;
