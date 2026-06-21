"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProfile } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";

export type ResetPasswordState = {
  error?: "generic";
  ok?: boolean;
  toastId?: string;
};

async function resolveLocale() {
  const requested = await getLocale();
  return hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
}

function scrambledPassword() {
  return `${randomBytes(32).toString("base64url")}A1!`;
}

export async function resetUserPassword(
  _previousState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const locale = await resolveLocale();
  const profile = await getProfile();
  if (!profile?.is_admin) {
    redirect({ href: "/fixtures", locale });
    return {};
  }

  const userId = String(formData.get("userId") ?? "").trim();
  if (!userId) return { error: "generic", toastId: `reset-${Date.now()}` };

  const admin = createAdminClient();
  const { data: flaggedProfile, error: flagError } = await admin
    .from("profiles")
    .update({ password_reset_pending: true })
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  if (flagError || !flaggedProfile) {
    return { error: "generic", toastId: `reset-${userId}-${Date.now()}` };
  }

  const { error: passwordError } = await admin.auth.admin.updateUserById(
    userId,
    { password: scrambledPassword() },
  );

  if (passwordError) {
    await admin
      .from("profiles")
      .update({ password_reset_pending: false })
      .eq("id", userId);

    return { error: "generic", toastId: `reset-${userId}-${Date.now()}` };
  }

  revalidatePath(`/${locale}/admin/users`);
  return { ok: true, toastId: `reset-${userId}-${Date.now()}` };
}
