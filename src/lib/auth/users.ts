import "server-only";

import type { User } from "@supabase/supabase-js";

import { usernameToEmail } from "@/lib/auth/password-policy";
import { createAdminClient } from "@/lib/supabase/admin";

// Look up an auth user by email. `email` must already be normalized
// (lowercased + trimmed) — see `normalizeEmail` in `password-policy.ts`.
export async function findUserByEmail(email: string): Promise<User | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) throw error;

  return (
    data.users.find((user) => user.email?.trim().toLowerCase() === email) ??
    null
  );
}

// Look up an auth user by username. `username` must already be normalized
// (lowercased + trimmed) — see `normalizeUsername` in `password-policy.ts`.
export async function findUserByUsername(
  username: string,
): Promise<User | null> {
  return findUserByEmail(usernameToEmail(username));
}
