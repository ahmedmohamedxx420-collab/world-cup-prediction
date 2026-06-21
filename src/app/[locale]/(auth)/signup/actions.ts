"use server";

import { hasLocale } from "next-intl";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { promoteEmailAdminProfile } from "@/lib/auth/phone-admin";
import {
  isValidEmail,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "@/lib/auth/password-policy";
import { findUserByEmail } from "@/lib/auth/users";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SignUpState = {
  error?:
    | "invalidEmail"
    | "emailTaken"
    | "passwordTooShort"
    | "passwordsDontMatch"
    | "generic";
};

function resolveLocale(formData: FormData) {
  const requestedLocale = String(formData.get("locale") ?? "");
  return hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
}

export async function signUpWithEmailPassword(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const locale = resolveLocale(formData);
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!isValidEmail(email)) return { error: "invalidEmail" };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: "passwordTooShort" };
  }
  if (password !== confirmPassword) {
    return { error: "passwordsDontMatch" };
  }

  // The email already has an account — send them to login (prefilled) instead
  // of failing the sign-up. This is the reliable duplicate check; the
  // createUser error below stays only as a guard against a creation race.
  let existingUser;
  try {
    existingUser = await findUserByEmail(email);
  } catch (error) {
    console.error("Sign-up lookup failed", error);
    return { error: "generic" };
  }

  // redirect() throws, so it must sit outside the try/catch above.
  if (existingUser) {
    redirect({ href: `/login?email=${encodeURIComponent(email)}`, locale });
  }

  const admin = createAdminClient();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError) {
    if (/already|registered|exists/i.test(createError.message)) {
      return { error: "emailTaken" };
    }
    return { error: "generic" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  const userId = data.user?.id ?? created.user?.id;
  if (error || !userId) return { error: "generic" };

  const promotionError = await promoteEmailAdminProfile(userId, email);
  if (promotionError) return { error: "generic" };

  redirect({ href: "/onboarding", locale });
  return {};
}
