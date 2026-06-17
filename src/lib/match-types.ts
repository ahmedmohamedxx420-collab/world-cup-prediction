// Client-safe match constants and types (NO "server-only" import) so client
// components (e.g. the fixture form) can use them. Server-side data access lives
// in matches.ts, which re-exports these for server consumers.

// The seven knockout-aware stages, in tournament order. Kept in sync with the
// CHECK constraint in 0002_core_schema.sql; the order drives grouping in the
// admin fixture list.
export const MATCH_STAGES = [
  "group",
  "round_32",
  "round_16",
  "quarter",
  "semi",
  "third_place",
  "final",
] as const;

export type MatchStage = (typeof MATCH_STAGES)[number];

export type MatchStatus = "scheduled" | "live" | "finished";

export type Match = {
  id: number;
  match_number: number | null;
  stage: MatchStage;
  group_letter: string | null;
  home_team_id: number | null;
  away_team_id: number | null;
  home_label: string | null;
  away_label: string | null;
  kickoff_at: string;
  venue: string | null;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  shootout_winner_team_id: number | null;
};
