import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  locale: string;
  created_at: string;
};

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, is_admin, locale, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  return data as Profile | null;
}
