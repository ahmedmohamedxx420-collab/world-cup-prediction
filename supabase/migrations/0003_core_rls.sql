-- Phase 2.2 — RLS policies + the is_admin() helper + member column grants.
-- Apply after 0002_core_schema.sql. RLS was already ENABLED on every table in
-- 0002 (deny-all); this file adds the policies that open the right access.
--
-- Prediction privacy is the core rule (PROJECT-CONTEXT.md §7): a prediction is
-- readable only if it is yours OR its match has already kicked off. Writes are
-- own-row and pre-kickoff only. This is enforced here, in the database.

-- is_admin() helper ---------------------------------------------------------
-- SECURITY DEFINER so it reads profiles WITHOUT triggering profiles' own RLS —
-- a policy that selected profiles directly would recurse. Owned by the
-- migration role (superuser), so it bypasses RLS as intended. search_path is
-- pinned to avoid hijacking.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and is_admin
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- predictions ---------------------------------------------------------------
-- SELECT: your own pick always; anyone's pick once the match has kicked off.
create policy "Read own predictions or any after kickoff"
on public.predictions
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.matches m
    where m.id = match_id and now() >= m.kickoff_at
  )
);

-- INSERT: only your own row, only before kickoff.
create policy "Insert own predictions before kickoff"
on public.predictions
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.matches m
    where m.id = match_id and now() < m.kickoff_at
  )
);

-- UPDATE: only your own row, and still only before kickoff.
create policy "Update own predictions before kickoff"
on public.predictions
for update
to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.matches m
    where m.id = match_id and now() < m.kickoff_at
  )
);

-- No DELETE policy: members cannot delete predictions (not in scope).

-- Column grants: a member may only write the score columns, so points_awarded
-- can never be self-set. The scoring function (0006) is SECURITY DEFINER and
-- writes points_awarded regardless. Same pattern as profiles.is_admin in 0001.
revoke insert, update on public.predictions from authenticated, anon;
grant insert (user_id, match_id, home_score, away_score) on public.predictions to authenticated;
grant update (home_score, away_score) on public.predictions to authenticated;

-- teams / matches / app_settings -------------------------------------------
-- Read for any authenticated user; all writes require admin. Admin writes run
-- as the admin user and are therefore RLS-enforced (no service-role needed).

create policy "Authenticated can read teams"
on public.teams for select to authenticated using (true);
create policy "Admins manage teams"
on public.teams for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Authenticated can read matches"
on public.matches for select to authenticated using (true);
create policy "Admins manage matches"
on public.matches for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Authenticated can read app_settings"
on public.app_settings for select to authenticated using (true);
create policy "Admins manage app_settings"
on public.app_settings for all to authenticated
using (public.is_admin()) with check (public.is_admin());
