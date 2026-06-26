import "server-only";

import type { AppSettings } from "@/lib/app-settings";
import type { Match } from "@/lib/match-types";
import { formatScoreline } from "@/lib/match-format";
import type { PredictionWithProfile } from "@/lib/predictions";
import { scoreTier, tierPoints } from "@/lib/scoring";

// Aggregate, privacy-safe "what did the family vote" insights for a match that
// has kicked off. Every field is derived purely from the predictions the caller
// is already allowed to see (RLS gates `predictions` by `now() >= kickoff_at`),
// the official result, and the configurable scoring tiers. No extra queries.

export type Outcome = "home" | "draw" | "away";

export type InsightMember = {
  name: string | null;
  avatar: string | null;
};

export type CrowdInsights = {
  total: number;
  verdict: {
    home: OutcomeShare;
    draw: OutcomeShare;
    away: OutcomeShare;
    /** The single leading outcome, or null when the top is tied (a true split). */
    favorite: Outcome | null;
  };
  topScorelines: ScorelineCount[];
  average: { home: number; away: number; total: number };
  boldest: { member: InsightMember; score: string; total: number } | null;
  // Result-dependent: null until the match has a final score.
  calledIt: { status: "nailed" | "fooled" | "split"; actual: Outcome } | null;
  bullseye: InsightMember[] | null;
  podium: PodiumEntry[] | null;
  loneWolf: { member: InsightMember; outcome: Outcome } | null;
};

type OutcomeShare = { count: number; pct: number };
type ScorelineCount = { score: string; count: number; pct: number };
type PodiumEntry = { member: InsightMember; points: number };

function outcomeOf(home: number, away: number): Outcome {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}

function memberOf(prediction: PredictionWithProfile): InsightMember {
  return {
    name: prediction.profile?.full_name ?? null,
    avatar: prediction.profile?.avatar_url ?? null,
  };
}

function pct(count: number, total: number): number {
  return total ? Math.round((count / total) * 100) : 0;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function computeCrowdInsights(
  predictions: PredictionWithProfile[],
  match: Match,
  settings: AppSettings,
): CrowdInsights | null {
  const total = predictions.length;
  if (total === 0) return null;

  // Winner split.
  let home = 0;
  let draw = 0;
  let away = 0;
  for (const p of predictions) {
    const outcome = outcomeOf(p.home_score, p.away_score);
    if (outcome === "home") home += 1;
    else if (outcome === "away") away += 1;
    else draw += 1;
  }
  const topCount = Math.max(home, draw, away);
  const leaders = (["home", "draw", "away"] as Outcome[]).filter(
    (o) => ({ home, draw, away })[o] === topCount,
  );
  const favorite = leaders.length === 1 ? leaders[0] : null;

  // Most-common scorelines (top 3).
  const tally = new Map<string, number>();
  for (const p of predictions) {
    const key = formatScoreline(p.home_score, p.away_score) as string;
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }
  const topScorelines: ScorelineCount[] = [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([score, count]) => ({ score, count, pct: pct(count, total) }));

  // Family average scoreline.
  const sumHome = predictions.reduce((acc, p) => acc + p.home_score, 0);
  const sumAway = predictions.reduce((acc, p) => acc + p.away_score, 0);
  const average = {
    home: round1(sumHome / total),
    away: round1(sumAway / total),
    total: round1((sumHome + sumAway) / total),
  };

  // Boldest call: the highest-scoring scoreline anyone predicted.
  const boldestPick = predictions.reduce((best, p) =>
    p.home_score + p.away_score > best.home_score + best.away_score ? p : best,
  );
  const boldest = {
    member: memberOf(boldestPick),
    score: formatScoreline(
      boldestPick.home_score,
      boldestPick.away_score,
    ) as string,
    total: boldestPick.home_score + boldestPick.away_score,
  };

  const insights: CrowdInsights = {
    total,
    verdict: {
      home: { count: home, pct: pct(home, total) },
      draw: { count: draw, pct: pct(draw, total) },
      away: { count: away, pct: pct(away, total) },
      favorite,
    },
    topScorelines,
    average,
    boldest,
    calledIt: null,
    bullseye: null,
    podium: null,
    loneWolf: null,
  };

  // Result-dependent cards require a final score.
  if (match.home_score == null || match.away_score == null) return insights;
  const actual = outcomeOf(match.home_score, match.away_score);

  insights.calledIt = {
    status:
      favorite == null ? "split" : favorite === actual ? "nailed" : "fooled",
    actual,
  };

  const points = {
    exact: settings.exact_points,
    margin: settings.goal_diff_points,
    winner: settings.winner_points,
  };
  const scored = predictions.map((p) => {
    const tier = scoreTier(
      p.home_score,
      p.away_score,
      match.home_score as number,
      match.away_score as number,
    );
    return { prediction: p, tier, points: tierPoints(tier, points) };
  });

  insights.bullseye = scored
    .filter((s) => s.tier === "exact")
    .map((s) => memberOf(s.prediction));

  insights.podium = [...scored]
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map((s) => ({ member: memberOf(s.prediction), points: s.points }));

  // Lone wolf: the only member who backed the actual outcome — only a fun fact
  // when there were several picks to stand out from.
  const backedActual = predictions.filter(
    (p) => outcomeOf(p.home_score, p.away_score) === actual,
  );
  if (total >= 3 && backedActual.length === 1) {
    insights.loneWolf = { member: memberOf(backedActual[0]), outcome: actual };
  }

  return insights;
}
