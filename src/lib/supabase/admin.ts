import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — BYPASSES RLS. Only ever import this from server-only
// code (Route Handlers, Server Actions, admin tasks). `server-only` makes the
// build fail if it is ever pulled into a client bundle.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
