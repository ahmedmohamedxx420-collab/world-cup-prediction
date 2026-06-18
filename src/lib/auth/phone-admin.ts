import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

const SYNTHETIC_EMAIL_DOMAIN = "phone.local";
const ADMIN_PHONE_CANONICAL_DIGITS = "966595440204";

const ADMIN_PHONE_DIGITS = new Set([
  ADMIN_PHONE_CANONICAL_DIGITS,
  "9660595440204",
  "0595440204",
  "595440204",
]);

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
  const normalized = digits.replace(/\D/g, "");

  if (ADMIN_PHONE_DIGITS.has(normalized)) return true;
  if (normalized.startsWith("9660")) {
    return `966${normalized.slice(4)}` === ADMIN_PHONE_CANONICAL_DIGITS;
  }
  if (normalized.startsWith("0")) {
    return `966${normalized.slice(1)}` === ADMIN_PHONE_CANONICAL_DIGITS;
  }
  if (normalized.length === 9) {
    return `966${normalized}` === ADMIN_PHONE_CANONICAL_DIGITS;
  }

  return false;
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
