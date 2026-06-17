"use server";

import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { MATCH_STAGES, type MatchStage } from "@/lib/matches";

export type FixtureFormState = {
  error?: "stageRequired" | "kickoffRequired" | "generic";
};

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function intOrNull(formData: FormData, name: string) {
  const value = field(formData, name);
  return value ? Number(value) : null;
}

async function resolveLocale() {
  const requested = await getLocale();
  return hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
}

// Handles both add (no id) and edit (hidden id). status/score columns are NOT
// set here — status is derived from scores by the trigger in 0006, and scores
// are entered on the Results tab. Kickoff is entered and stored as UTC.
export async function saveFixture(
  _previousState: FixtureFormState,
  formData: FormData,
): Promise<FixtureFormState> {
  const idRaw = field(formData, "id");
  const stage = field(formData, "stage") as MatchStage;
  const kickoffRaw = field(formData, "kickoff_at");

  if (!stage || !MATCH_STAGES.includes(stage)) return { error: "stageRequired" };
  if (!kickoffRaw) return { error: "kickoffRequired" };

  // datetime-local has no zone; the field is labelled UTC, so pin it to UTC.
  const kickoff = new Date(`${kickoffRaw}:00Z`);
  if (Number.isNaN(kickoff.getTime())) return { error: "kickoffRequired" };

  const payload = {
    match_number: intOrNull(formData, "match_number"),
    stage,
    group_letter: field(formData, "group_letter").toUpperCase() || null,
    home_team_id: intOrNull(formData, "home_team_id"),
    away_team_id: intOrNull(formData, "away_team_id"),
    home_label: field(formData, "home_label") || null,
    away_label: field(formData, "away_label") || null,
    kickoff_at: kickoff.toISOString(),
    venue: field(formData, "venue") || null,
  };

  const supabase = await createClient();
  const { error } = idRaw
    ? await supabase.from("matches").update(payload).eq("id", Number(idRaw))
    : await supabase.from("matches").insert(payload);

  if (error) return { error: "generic" };

  redirect({
    href: "/admin/fixtures?toast=fixtureSaved",
    locale: await resolveLocale(),
  });
  return {};
}
