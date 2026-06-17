import "server-only";

import type { Match } from "@/lib/match-types";
import { createClient } from "@/lib/supabase/server";

export type LeaderboardRow = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  predictions_made: number;
  scored_count: number;
  exact_count: number;
  gd_count: number;
  winner_count: number;
  miss_count: number;
  rank: number;
};

export type MemberProfile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

export type UserResult = {
  id: string;
  user_id: string;
  match_id: number;
  home_score: number;
  away_score: number;
  points_awarded: number | null;
  created_at: string;
  updated_at: string;
  match: Match;
};

type RawUserResult = Omit<UserResult, "match"> & {
  match: Match | Match[] | null;
};

const RESULT_COLUMNS = `
  id,
  user_id,
  match_id,
  home_score,
  away_score,
  points_awarded,
  created_at,
  updated_at,
  match:matches!predictions_match_id_fkey(
    id,
    match_number,
    stage,
    group_letter,
    home_team_id,
    away_team_id,
    home_label,
    away_label,
    kickoff_at,
    venue,
    status,
    home_score,
    away_score,
    shootout_winner_team_id
  )
`;

function normalizeMatch(match: RawUserResult["match"]): Match | null {
  if (Array.isArray(match)) return match[0] ?? null;
  return match;
}

function compareResults(a: UserResult, b: UserResult) {
  const aNumber = a.match.match_number ?? Number.MAX_SAFE_INTEGER;
  const bNumber = b.match.match_number ?? Number.MAX_SAFE_INTEGER;
  if (aNumber !== bNumber) return aNumber - bNumber;

  const aKickoff = Date.parse(a.match.kickoff_at);
  const bKickoff = Date.parse(b.match.kickoff_at);
  if (!Number.isNaN(aKickoff) && !Number.isNaN(bKickoff)) {
    const kickoffDelta = aKickoff - bKickoff;
    if (kickoffDelta !== 0) return kickoffDelta;
  }

  return a.match_id - b.match_id;
}

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_leaderboard");

  if (error) throw error;

  return (data ?? []) as LeaderboardRow[];
}

export async function getUserResults(userId: string): Promise<UserResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("predictions")
    .select(RESULT_COLUMNS)
    .eq("user_id", userId);

  if (error) throw error;

  return ((data ?? []) as RawUserResult[])
    .map((result) => {
      const match = normalizeMatch(result.match);
      if (!match) return null;

      return {
        id: result.id,
        user_id: result.user_id,
        match_id: result.match_id,
        home_score: result.home_score,
        away_score: result.away_score,
        points_awarded: result.points_awarded,
        created_at: result.created_at,
        updated_at: result.updated_at,
        match,
      };
    })
    .filter((result): result is UserResult => result != null)
    .sort(compareResults);
}

export async function getMemberProfile(
  userId: string,
): Promise<MemberProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  return (data as MemberProfile | null) ?? null;
}
