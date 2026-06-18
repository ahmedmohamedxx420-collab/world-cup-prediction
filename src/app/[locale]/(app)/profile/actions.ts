"use server";

import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { avatarObjectPath, normalizeOwnAvatarUrl } from "@/lib/avatar-url";
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

  const avatar = normalizeOwnAvatarUrl(formData.get("avatarUrl"), user.id);
  if (!avatar.ok) return { error: "generic" };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, avatar_url: avatar.avatarUrl, locale })
    .eq("id", user.id);

  if (error) return { error: "generic" };

  if (!avatar.avatarUrl) {
    await supabase.storage.from("avatars").remove([avatarObjectPath(user.id)]);
  }

  redirect({ href: "/profile?toast=profileSaved", locale });
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
