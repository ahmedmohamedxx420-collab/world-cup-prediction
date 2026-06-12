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
Phase 1 migrations are not designed to be run twice.
