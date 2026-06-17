"use server";

import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export type TeamFormState = {
  error?: "required" | "duplicateCode" | "generic";
};

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

async function resolveLocale() {
  const requested = await getLocale();
  return hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
}

// Handles both add (no id) and edit (hidden id). RLS additionally requires the
// caller to be an admin; the admin layout already gates the UI.
export async function saveTeam(
  _previousState: TeamFormState,
  formData: FormData,
): Promise<TeamFormState> {
  const idRaw = field(formData, "id");
  const name_en = field(formData, "name_en");
  const name_ar = field(formData, "name_ar");
  const code = field(formData, "code").toUpperCase();
  const flag = field(formData, "flag") || null;
  const group_letter = field(formData, "group_letter").toUpperCase() || null;

  if (!name_en || !name_ar || !code) return { error: "required" };

  const supabase = await createClient();
  const payload = { name_en, name_ar, code, flag, group_letter };

  const { error } = idRaw
    ? await supabase.from("teams").update(payload).eq("id", Number(idRaw))
    : await supabase.from("teams").insert(payload);

  if (error) {
    if (error.code === "23505") return { error: "duplicateCode" };
    return { error: "generic" };
  }

  redirect({ href: "/admin/teams?toast=teamSaved", locale: await resolveLocale() });
  return {};
}
