"use server";

import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export type ResultFormState = {
  error?: "invalidScore" | "generic";
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

// Setting both scores fires the DB triggers (0006): status -> finished and
// every prediction for the match is (re)scored. Shootout winner is display-only.
export async function recordResult(
  _previousState: ResultFormState,
  formData: FormData,
): Promise<ResultFormState> {
  const matchId = Number(field(formData, "match_id"));
  const homeRaw = field(formData, "home_score");
  const awayRaw = field(formData, "away_score");
  const home = Number(homeRaw);
  const away = Number(awayRaw);
  const shootoutRaw = field(formData, "shootout_winner_team_id");

  if (!Number.isInteger(matchId)) return { error: "generic" };
  if (
    homeRaw === "" ||
    awayRaw === "" ||
    !Number.isInteger(home) ||
    !Number.isInteger(away) ||
    home < 0 ||
    away < 0
  ) {
    return { error: "invalidScore" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("matches")
    .update({
      home_score: home,
      away_score: away,
      shootout_winner_team_id: shootoutRaw ? Number(shootoutRaw) : null,
    })
    .eq("id", matchId);

  if (error) return { error: "generic" };

  redirect({
    href: "/admin/results?toast=resultSaved",
    locale: await resolveLocale(),
  });
  return {};
}

// Clearing the scores fires the triggers in reverse: status -> scheduled and
// the match's predictions are reset to unscored (points_awarded = null).
export async function clearResult(formData: FormData): Promise<void> {
  const matchId = Number(field(formData, "match_id"));
  if (!Number.isInteger(matchId)) return;

  const supabase = await createClient();
  await supabase
    .from("matches")
    .update({
      home_score: null,
      away_score: null,
      shootout_winner_team_id: null,
    })
    .eq("id", matchId);

  redirect({
    href: "/admin/results?toast=resultCleared",
    locale: await resolveLocale(),
  });
}
