"use server";

import { hasLocale } from "next-intl";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { promoteUsernameAdminProfile } from "@/lib/auth/phone-admin";
import {
  isValidUsername,
  MIN_PASSWORD_LENGTH,
  normalizeUsername,
  usernameToEmail,
} from "@/lib/auth/password-policy";
import { findUserByUsername } from "@/lib/auth/users";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type SignUpState = {
  error?:
    | "invalidUsername"
    | "usernameTaken"
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

export async function signUpWithUsernamePassword(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const locale = resolveLocale(formData);
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!isValidUsername(username)) return { error: "invalidUsername" };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: "passwordTooShort" };
  }
  if (password !== confirmPassword) {
    return { error: "passwordsDontMatch" };
  }

  // The username is already taken — send them to login (prefilled) instead of
  // failing the sign-up. This is the reliable duplicate check; the createUser
  // error below stays only as a guard against a creation race.
  let existingUser;
  try {
    existingUser = await findUserByUsername(username);
  } catch (error) {
    console.error("Sign-up lookup failed", error);
    return { error: "generic" };
  }

  // redirect() throws, so it must sit outside the try/catch above.
  if (existingUser) {
    redirect({ href: `/login?username=${encodeURIComponent(username)}`, locale });
  }

  const admin = createAdminClient();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: usernameToEmail(username),
      password,
      email_confirm: true,
      user_metadata: { username },
    });

  if (createError) {
    if (/already|registered|exists/i.test(createError.message)) {
      return { error: "usernameTaken" };
    }
    return { error: "generic" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  const userId = data.user?.id ?? created.user?.id;
  if (error || !userId) return { error: "generic" };

  const promotionError = await promoteUsernameAdminProfile(userId, username);
  if (promotionError) return { error: "generic" };

  redirect({ href: "/onboarding", locale });
  return {};
}
