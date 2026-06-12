"use server";

import { hasLocale } from "next-intl";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
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

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    full_name: fullName,
    locale,
  });

  if (error && error.code !== "23505") return { error: "generic" };

  redirect({ href: "/fixtures", locale });
  return {};
}
