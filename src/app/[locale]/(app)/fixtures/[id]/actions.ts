"use server";

import { revalidatePath } from "next/cache";
import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export type PredictionFormState = {
  saved?: boolean;
  error?: "validation" | "locked" | "generic";
};

type DbError = {
  code?: string;
  message?: string;
};

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function parseScore(value: string) {
  if (!/^\d+$/.test(value)) return null;
  const score = Number(value);
  if (!Number.isInteger(score) || score < 0 || score > 99) return null;
  return score;
}

async function resolveLocale() {
  const requested = await getLocale();
  return hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
}

function isLockedError(error: DbError) {
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42501" ||
    message.includes("row-level security") ||
    message.includes("permission denied")
  );
}

async function revalidatePredictionPaths(matchId: number) {
  const locale = await resolveLocale();
  revalidatePath(`/${locale}/fixtures`);
  revalidatePath(`/${locale}/fixtures/${matchId}`);
}

export async function savePrediction(
  _previousState: PredictionFormState,
  formData: FormData,
): Promise<PredictionFormState> {
  const matchId = Number(field(formData, "match_id"));
  const homeScore = parseScore(field(formData, "home_score"));
  const awayScore = parseScore(field(formData, "away_score"));

  if (!Number.isInteger(matchId) || matchId <= 0) {
    return { error: "validation" };
  }

  if (homeScore == null || awayScore == null) {
    return { error: "validation" };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { error: "generic" };

  const values = { home_score: homeScore, away_score: awayScore };
  const { data: updated, error: updateError } = await supabase
    .from("predictions")
    .update(values)
    .eq("user_id", user.id)
    .eq("match_id", matchId)
    .select("id");

  if (updateError) {
    return { error: isLockedError(updateError) ? "locked" : "generic" };
  }

  if ((updated ?? []).length > 0) {
    await revalidatePredictionPaths(matchId);
    return { saved: true };
  }

  const { error: insertError } = await supabase.from("predictions").insert({
    user_id: user.id,
    match_id: matchId,
    ...values,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      const { error: retryError } = await supabase
        .from("predictions")
        .update(values)
        .eq("user_id", user.id)
        .eq("match_id", matchId);

      if (!retryError) {
        await revalidatePredictionPaths(matchId);
        return { saved: true };
      }

      return { error: isLockedError(retryError) ? "locked" : "generic" };
    }

    return { error: isLockedError(insertError) ? "locked" : "generic" };
  }

  await revalidatePredictionPaths(matchId);
  return { saved: true };
}
