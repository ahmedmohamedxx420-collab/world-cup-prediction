import "server-only";

import { normalizeUsername } from "@/lib/auth/password-policy";
import { createAdminClient } from "@/lib/supabase/admin";

const SYNTHETIC_EMAIL_DOMAIN = "phone.local";
const ADMIN_PHONE_CANONICAL_DIGITS = "966595440204";
export const ADMIN_EMAIL = "ahmed.mohamed.xx420@gmail.com";
export const ADMIN_USERNAME = "admin";

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

export function isAdminEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}

export function isAdminUsername(username: string | null | undefined) {
  if (!username) return false;
  return normalizeUsername(username) === ADMIN_USERNAME;
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

export async function promoteEmailAdminProfile(
  userId: string,
  email: string | null | undefined,
) {
  if (!userId || !isAdminEmail(email)) return null;

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_admin: true })
    .eq("id", userId);

  return error;
}

export async function promoteUsernameAdminProfile(
  userId: string,
  username: string | null | undefined,
) {
  if (!userId || !isAdminUsername(username)) return null;

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_admin: true })
    .eq("id", userId);

  return error;
}
