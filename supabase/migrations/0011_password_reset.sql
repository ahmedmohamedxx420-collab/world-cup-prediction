-- Password auth support: admin-driven manual password resets.
-- Apply after 0010_avatars_storage.sql.

alter table public.profiles
add column password_reset_pending boolean not null default false;

-- Member profile updates are already narrowed to full_name/avatar_url/locale in
-- 0001. Keep this explicit so the reset flag is visibly service-role only.
revoke update (password_reset_pending) on table public.profiles from authenticated, anon;
