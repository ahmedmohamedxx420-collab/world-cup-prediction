"use server";

import { createHmac } from "node:crypto";
import { hasLocale } from "next-intl";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { promotePhoneAdminProfile } from "@/lib/auth/phone-admin";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PhoneLoginState = {
  error?: "invalidPhone" | "generic";
};

// --- Fake "phone number" sign-in -------------------------------------------
//
// There is NO SMS and NO verification: typing a phone number is the whole
// login. The point is convenience for a trusted friend group, not security.
//
// It still mints a *real* Supabase session, because every RLS rule in this app
// keys off `auth.uid()`. We map a phone number to a synthetic Supabase account:
//
//   email    = `<digits>@phone.local`   (never receives mail)
//   password = HMAC(digits, PHONE_AUTH_SECRET)   (derived server-side only)
//
// First time a number signs in we create the auth user via the service-role
// admin client with `email_confirm: true` (so no confirmation email is needed),
// then sign in with the cookie-bound server client. The browser never sees the
// password — it only ever sends the phone number.
//
// To reuse the real email-OTP flow in another project, set
// NEXT_PUBLIC_AUTH_MODE=otp; this file is then unused.

const SYNTHETIC_EMAIL_DOMAIN = "phone.local";

function normalizePhone(raw: string): string | null {
  // Keep digits only; this becomes the stable identity for the account.
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 15) return null;
  return digits;
}

function syntheticCredentials(digits: string) {
  const secret = process.env.PHONE_AUTH_SECRET ?? "world-cup-phone-auth";
  const password = createHmac("sha256", secret).update(digits).digest("hex");
  return { email: `${digits}@${SYNTHETIC_EMAIL_DOMAIN}`, password };
}

export async function signInWithPhone(
  _previousState: PhoneLoginState,
  formData: FormData,
): Promise<PhoneLoginState> {
  const digits = normalizePhone(String(formData.get("phone") ?? ""));
  const requestedLocale = String(formData.get("locale") ?? "");
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  if (!digits) return { error: "invalidPhone" };

  const { email, password } = syntheticCredentials(digits);
  const supabase = await createClient();

  // Try signing in first (existing number).
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // New number: create the account (email pre-confirmed) then sign in.
  if (error) {
    const admin = createAdminClient();
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { phone: digits },
    });

    // Ignore "already registered" (a racing request created it); any other
    // creation failure is a real error.
    if (createError && !/already/i.test(createError.message)) {
      return { error: "generic" };
    }

    ({ data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    }));

    if (error) return { error: "generic" };
  }

  const userId = data.user?.id;
  if (!userId) return { error: "generic" };

  // Send brand-new users to onboarding (name + language); returning users with
  // a profile go straight to fixtures. Mirrors the email-OTP flow.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) return { error: "generic" };

  if (profile) {
    const promotionError = await promotePhoneAdminProfile(userId, digits);
    if (promotionError) return { error: "generic" };
  }

  redirect({ href: profile ? "/fixtures" : "/onboarding", locale });
  return {};
}
