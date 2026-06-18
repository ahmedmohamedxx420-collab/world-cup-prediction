import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

const SYNTHETIC_EMAIL_DOMAIN = "phone.local";

const ADMIN_PHONE_DIGITS = new Set(["966595440204"]);

export function phoneDigitsFromSyntheticEmail(
  email: string | null | undefined,
) {
  const match = email?.match(
    new RegExp(`^(\\d+)@${SYNTHETIC_EMAIL_DOMAIN.replace(".", "\\.")}$`),
  );

  return match?.[1] ?? null;
}

export function isAdminPhoneDigits(digits: string | null | undefined) {
  if (!digits) return false;
  return ADMIN_PHONE_DIGITS.has(digits.replace(/\D/g, ""));
}

export async function promotePhoneAdminProfile(
  userId: string,
  phoneDigits: string | null | undefined,
) {
  if (!userId || !isAdminPhoneDigits(phoneDigits)) return null;

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_admin: true })
    .eq("id", userId);

  return error;
}
