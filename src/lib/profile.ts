import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  locale: string;
  created_at: string;
};

// Request-scoped memoization (React `cache`). Within a single render the (app)
// layout, the admin layout, and the page all read the user/profile — `cache`
// collapses those repeated Supabase round-trips into one `getUser()` + one
// `profiles` query. It is per-request, so nothing leaks across requests/users.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, is_admin, locale, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  return (data as Profile | null) ?? null;
});
