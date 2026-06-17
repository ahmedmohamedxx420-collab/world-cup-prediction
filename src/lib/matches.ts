import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Match } from "./match-types";

// Re-export the client-safe constants/types so server code can keep importing
// everything from "@/lib/matches". Client components must import these from
// "@/lib/match-types" instead (this module is server-only).
export { MATCH_STAGES } from "./match-types";
export type { Match, MatchStage, MatchStatus } from "./match-types";

const MATCH_COLUMNS =
  "id, match_number, stage, group_letter, home_team_id, away_team_id, home_label, away_label, kickoff_at, venue, status, home_score, away_score, shootout_winner_team_id";

export async function listMatches(): Promise<Match[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(MATCH_COLUMNS)
    .order("kickoff_at", { ascending: true })
    .order("match_number", { ascending: true, nullsFirst: false });

  if (error) throw error;

  return (data ?? []) as Match[];
}

export async function getMatch(id: number): Promise<Match | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(MATCH_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return (data as Match | null) ?? null;
}
