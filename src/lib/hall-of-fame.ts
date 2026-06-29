import type { MemberStatsRow, UserResult } from "@/lib/leaderboard";
import { formatScoreline } from "@/lib/match-format";

export type BadgeKey =
  | "sniper"
  | "hotStreak"
  | "onForm"
  | "sharpshooter"
  | "lastMinuteLarry"
  | "goalMachine"
  | "theWall"
  | "soClose";

export type Badge = {
  key: BadgeKey;
  holderUserId: string | null;
  holderName: string | null;
  holderAvatarUrl: string | null;
  value: number | null;
};

export type FormDot = "exact" | "partial" | "miss";

export type PlayerStats = {
  formDots: FormDot[];
  currentStreak: number;
  bestStreak: number;
  favouriteScoreline: string | null;
  bestMatch: UserResult | null;
};

const BADGE_KEYS: BadgeKey[] = [
  "sniper",
  "hotStreak",
  "onForm",
  "sharpshooter",
  "lastMinuteLarry",
  "goalMachine",
  "theWall",
  "soClose",
];

type Candidate = {
  row: MemberStatsRow;
  value: number;
};

function compareByTieBreak(a: MemberStatsRow, b: MemberStatsRow) {
  if (a.total_points !== b.total_points) {
    return b.total_points - a.total_points;
  }

  if (a.full_name < b.full_name) return -1;
  if (a.full_name > b.full_name) return 1;

  return a.user_id.localeCompare(b.user_id);
}

function winner(
  rows: MemberStatsRow[],
  valueFor: (row: MemberStatsRow) => number | null,
  direction: "max" | "min" = "max",
): Candidate | null {
  const candidates = rows
    .map((row) => {
      const value = valueFor(row);
      return value == null ? null : { row, value };
    })
    .filter((candidate): candidate is Candidate => candidate != null);

  if (candidates.length === 0) return null;

  return candidates.sort((a, b) => {
    const metricDelta =
      direction === "max" ? b.value - a.value : a.value - b.value;
    if (metricDelta !== 0) return metricDelta;

    return compareByTieBreak(a.row, b.row);
  })[0];
}

function badge(key: BadgeKey, candidate: Candidate | null): Badge {
  return {
    key,
    holderUserId: candidate?.row.user_id ?? null,
    holderName: candidate?.row.full_name ?? null,
    holderAvatarUrl: candidate?.row.avatar_url ?? null,
    value: candidate?.value ?? null,
  };
}

export function computeHallOfFame(rows: MemberStatsRow[]): Badge[] {
  // Sharpshooter = true hit rate: the share of scored matches that earned any
  // points (exact, goal-diff, or winner). The previous formula used points
  // efficiency (total_points / max possible), which isn't a hit rate at all —
  // it just re-ranked by total points, so a player who landed every *winner*
  // read far below their real accuracy. Gated to >= 5 scored matches so a single
  // lucky pick can't top the board (matches the "after five scored" copy).
  const hitRate = (row: MemberStatsRow) => {
    if (row.scored_count < 5) return null;
    const hits = row.exact_count + row.gd_count + row.winner_count;
    return hits / row.scored_count;
  };

  return BADGE_KEYS.map((key) => {
    switch (key) {
      case "sniper":
        return badge(
          key,
          winner(rows, (row) => (row.exact_count > 0 ? row.exact_count : null)),
        );
      case "hotStreak":
        return badge(
          key,
          winner(rows, (row) =>
            row.longest_scoring_streak > 0
              ? row.longest_scoring_streak
              : null,
          ),
        );
      case "onForm":
        return badge(
          key,
          winner(rows, (row) =>
            row.scored_count > 0 ? row.last5_points : null,
          ),
        );
      case "sharpshooter":
        return badge(key, winner(rows, hitRate));
      case "lastMinuteLarry":
        return badge(
          key,
          winner(rows, (row) => row.avg_lead_seconds, "min"),
        );
      case "goalMachine":
        return badge(key, winner(rows, (row) => row.avg_goals_x100));
      case "theWall":
        return badge(key, winner(rows, (row) => row.avg_goals_x100, "min"));
      case "soClose":
        return badge(
          key,
          winner(rows, (row) => (row.gd_count > 0 ? row.gd_count : null)),
        );
    }
  });
}

function formDot(points: number, exactPoints: number): FormDot {
  if (points >= exactPoints) return "exact";
  if (points > 0) return "partial";
  return "miss";
}

export function computePlayerStats(
  results: UserResult[],
  exactPoints: number,
): PlayerStats {
  const scoredResults = results.filter(
    (result) => result.points_awarded != null,
  );
  const formDots = scoredResults
    .slice(-5)
    .map((result) => formDot(result.points_awarded ?? 0, exactPoints));

  let currentRun = 0;
  let bestStreak = 0;
  let runningStreak = 0;

  for (const result of scoredResults) {
    if ((result.points_awarded ?? 0) > 0) {
      runningStreak += 1;
      bestStreak = Math.max(bestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  for (let index = scoredResults.length - 1; index >= 0; index -= 1) {
    if ((scoredResults[index].points_awarded ?? 0) <= 0) break;
    currentRun += 1;
  }

  const scorelineCounts = new Map<string, number>();
  let favouriteScoreline: string | null = null;
  let favouriteCount = 0;

  for (const result of results) {
    const scoreline = formatScoreline(
      result.home_score,
      result.away_score,
    ) as string;
    const count = (scorelineCounts.get(scoreline) ?? 0) + 1;
    scorelineCounts.set(scoreline, count);

    if (count > favouriteCount) {
      favouriteScoreline = scoreline;
      favouriteCount = count;
    }
  }

  const bestMatch = scoredResults.reduce<UserResult | null>((best, result) => {
    if (!best) return result;
    return (result.points_awarded ?? 0) > (best.points_awarded ?? 0)
      ? result
      : best;
  }, null);

  return {
    formDots,
    currentStreak: currentRun,
    bestStreak,
    favouriteScoreline,
    bestMatch,
  };
}
