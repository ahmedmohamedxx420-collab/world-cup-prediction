import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server (Server Component / Route Handler / Server Action) Supabase client.
// Reads & writes the auth cookies so sessions persist across requests. Subject
// to RLS — this is the client to use for anything a logged-in user does.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` called from a Server Component — safe to ignore when
            // middleware/proxy refreshes the session.
          }
        },
      },
    },
  );
}
