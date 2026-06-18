"use server";

import { hasLocale } from "next-intl";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  phoneDigitsFromSyntheticEmail,
  promotePhoneAdminProfile,
} from "@/lib/auth/phone-admin";
import { normalizeOwnAvatarUrl } from "@/lib/avatar-url";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = {
  error?: "generic" | "nameRequired";
};

export async function completeOnboarding(
  _previousState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const requestedLocale = String(formData.get("locale") ?? "");
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  if (!fullName) return { error: "nameRequired" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
    return {};
  }

  const avatar = normalizeOwnAvatarUrl(formData.get("avatarUrl"), user.id);
  if (!avatar.ok) return { error: "generic" };

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    full_name: fullName,
    avatar_url: avatar.avatarUrl,
    locale,
  });

  if (error && error.code !== "23505") return { error: "generic" };

  const promotionError = await promotePhoneAdminProfile(
    user.id,
    phoneDigitsFromSyntheticEmail(user.email),
  );

  if (promotionError) return { error: "generic" };

  redirect({ href: "/fixtures", locale });
  return {};
}
