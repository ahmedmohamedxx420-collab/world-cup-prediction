"use server";

import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = {
  error?: "generic" | "nameRequired";
};

export async function updateProfile(
  _previousState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
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

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, locale })
    .eq("id", user.id);

  if (error) return { error: "generic" };

  redirect({ href: "/profile?saved=1", locale });
  return {};
}

export async function signOut() {
  const requestedLocale = await getLocale();
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const supabase = await createClient();

  await supabase.auth.signOut();
  redirect({ href: "/login", locale });
}
