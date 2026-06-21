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

export type PasswordLoginStep = "enter_password" | "set_password";

export type LookupLoginState = {
  email?: string;
  error?: "invalidEmail" | "generic";
  step?: PasswordLoginStep;
};

export type PasswordAuthState = {
  error?:
    | "invalidEmail"
    | "wrongPassword"
    | "passwordTooShort"
    | "passwordsDontMatch"
    | "accountNotFound"
    | "generic";
};

function resolveLocale(formData: FormData) {
  const requestedLocale = String(formData.get("locale") ?? "");
  return hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
}

async function redirectAfterSignIn({
  email,
  locale,
  supabase,
  userId,
}: {
  email: string;
  locale: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
}) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) return { error: "generic" as const };

  if (profile) {
    const promotionError = await promoteEmailAdminProfile(userId, email);
    if (promotionError) return { error: "generic" as const };
  }

  redirect({ href: profile ? "/fixtures" : "/onboarding", locale });
  return {};
}

export async function lookupLogin(
  _previousState: LookupLoginState,
  formData: FormData,
): Promise<LookupLoginState> {
  const locale = resolveLocale(formData);
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  if (!isValidEmail(email)) return { email, error: "invalidEmail" };

  try {
    const user = await findUserByEmail(email);

    if (user) {
      const admin = createAdminClient();
      const { data: profile, error } = await admin
        .from("profiles")
        .select("password_reset_pending")
        .eq("id", user.id)
        .maybeSingle();

      if (error) return { email, error: "generic" };

      return {
        email,
        step: profile?.password_reset_pending
          ? "set_password"
          : "enter_password",
      };
    }
  } catch (error) {
    console.error("Password login lookup failed", error);
    return { email, error: "generic" };
  }

  // No account for this email — send them straight to sign-up with the email
  // prefilled. (redirect() throws, so it must sit outside the try/catch above.)
  redirect({ href: `/signup?email=${encodeURIComponent(email)}`, locale });
  return { email };
}

export async function signInWithEmailPassword(
  _previousState: PasswordAuthState,
  formData: FormData,
): Promise<PasswordAuthState> {
  const locale = resolveLocale(formData);
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (!isValidEmail(email)) return { error: "invalidEmail" };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: "passwordTooShort" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  const userId = data.user?.id;
  if (error || !userId) return { error: "wrongPassword" };

  return redirectAfterSignIn({ email, locale, supabase, userId });
}

export async function setNewPassword(
  _previousState: PasswordAuthState,
  formData: FormData,
): Promise<PasswordAuthState> {
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

  try {
    const user = await findUserByEmail(email);
    if (!user) return { error: "accountNotFound" };

    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("password_reset_pending")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) return { error: "generic" };
    if (!profile?.password_reset_pending) return { error: "generic" };

    const { error: updateError } = await admin.auth.admin.updateUserById(
      user.id,
      { password },
    );

    if (updateError) return { error: "generic" };

    const { error: clearError } = await admin
      .from("profiles")
      .update({ password_reset_pending: false })
      .eq("id", user.id);

    if (clearError) return { error: "generic" };

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    const userId = data.user?.id;
    if (error || !userId) return { error: "generic" };

    return redirectAfterSignIn({ email, locale, supabase, userId });
  } catch (error) {
    console.error("Password reset claim failed", error);
    return { error: "generic" };
  }
}
