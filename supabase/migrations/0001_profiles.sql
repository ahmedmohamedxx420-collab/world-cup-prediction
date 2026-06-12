create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  is_admin boolean not null default false,
  locale text not null default 'ar',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Supabase grants table-wide UPDATE by default. Replace it with grants for only
-- the user-editable columns so owning a row never permits self-promotion.
revoke update on table public.profiles from authenticated, anon;
grant update (full_name, avatar_url, locale) on table public.profiles to authenticated;
revoke update (is_admin) on table public.profiles from authenticated, anon;
