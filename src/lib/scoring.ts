// Client-safe scoring helpers shared by the member UI. Display-only: the
// database `score_match()` trigger remains the source of truth for
// `points_awarded`. This mirrors the tiers in PROJECT-CONTEXT.md §5 so we can
// label *how* a prediction earned its points without re-querying.

export type ScoreTier = "exact" | "margin" | "winner" | "miss";

// Top-down order — the first matching tier wins; points never stack.
export const SCORE_TIERS: ScoreTier[] = ["exact", "margin", "winner", "miss"];

export type TierPoints = {
  exact: number;
  // "margin" = correct signed goal difference (app_settings.goal_diff_points).
  margin: number;
  winner: number;
};

// Which tier a prediction lands in against an actual result. Goal difference is
// signed (home − away), so a correct margin also implies the correct winner.
export function scoreTier(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
): ScoreTier {
  if (predHome === actualHome && predAway === actualAway) return "exact";
  if (predHome - predAway === actualHome - actualAway) return "margin";
  if (Math.sign(predHome - predAway) === Math.sign(actualHome - actualAway)) {
    return "winner";
  }
  return "miss";
}

// Point value a tier is worth under the current (configurable) settings.
export function tierPoints(tier: ScoreTier, points: TierPoints): number {
  if (tier === "exact") return points.exact;
  if (tier === "margin") return points.margin;
  if (tier === "winner") return points.winner;
  return 0;
}
