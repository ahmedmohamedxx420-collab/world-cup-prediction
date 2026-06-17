# Supabase migrations

Migrations are versioned SQL files under [`migrations/`](./migrations/). This
project does not use the Supabase CLI yet.

To apply a migration:

1. Open the Supabase dashboard for the project.
2. Go to **SQL Editor** and create a new query.
3. Paste the next unapplied migration file into the editor.
4. Run it once, then confirm the expected tables, policies, and RLS settings in
   **Table Editor**.

Apply files in numeric order. Keep a note of the last applied filename; these
migrations are not designed to be run twice.

## Migration order

| File | Phase | What it does |
|---|---|---|
| `0001_profiles.sql` | 1.0 | `profiles` table + RLS + member column grants |
| `0002_core_schema.sql` | 2.1 | `teams`, `matches`, `predictions`, `app_settings` (RLS enabled, deny-all until 0003) |
| `0003_core_rls.sql` | 2.2 | `is_admin()` helper, access policies, member column grants |
| `0006_scoring.sql` | 2.5 | `score_match()` + result-entry triggers |
| `0007_api_sync.sql` | 2.6 | `api_fixture_id` sync upsert key + `sync_runs` log (also adds an unused `api_team_id` column) |

> No `0004`/`0005` seed migrations: teams + fixtures are loaded by the **sync** (2.6,
> openfootball `worldcup.json`) via the admin **Sync** tab, not by a hand seed.

`0002` enables RLS on every table immediately, so the tables stay locked
(deny-all) even if you pause before applying `0003`.

## Grant admin to the owner

There is exactly one admin. After the owner has logged in once (so their
`profiles` row exists), run this once in the SQL editor:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'ahmed.mohamed.xx420@gmail.com');
```

The owner email is **not** baked into the schema; admin is set by this one-off
update. Members can never self-promote — `0001` revokes `is_admin` from the
member-editable column grants.
