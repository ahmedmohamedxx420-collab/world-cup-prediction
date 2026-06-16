import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Prediction = {
  id: string;
  user_id: string;
  match_id: number;
  home_score: number;
  away_score: number;
  points_awarded: number | null;
};

export type PredictionProfile = {
  full_name: string;
  avatar_url: string | null;
};

export type PredictionWithProfile = Prediction & {
  profile: PredictionProfile | null;
};

const PREDICTION_COLUMNS =
  "id, user_id, match_id, home_score, away_score, points_awarded";

type RawPredictionWithProfile = Prediction & {
  profile: PredictionProfile | PredictionProfile[] | null;
};

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user?.id ?? null;
}

function normalizeProfile(
  profile: RawPredictionWithProfile["profile"],
): PredictionProfile | null {
  if (Array.isArray(profile)) return profile[0] ?? null;
  return profile;
}

export async function getMyPredictions(): Promise<Map<number, Prediction>> {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) return new Map();

  const { data, error } = await supabase
    .from("predictions")
    .select(PREDICTION_COLUMNS)
    .eq("user_id", userId)
    .order("match_id", { ascending: true });

  if (error) throw error;

  return new Map(
    ((data ?? []) as Prediction[]).map((prediction) => [
      prediction.match_id,
      prediction,
    ]),
  );
}

export async function getMyPrediction(
  matchId: number,
): Promise<Prediction | null> {
  const supabase = await createClient();
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("predictions")
    .select(PREDICTION_COLUMNS)
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return (data as Prediction | null) ?? null;
}

export async function getMatchPredictions(
  matchId: number,
): Promise<PredictionWithProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("predictions")
    .select(
      `${PREDICTION_COLUMNS}, profile:profiles!predictions_user_id_fkey(full_name, avatar_url)`,
    )
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as RawPredictionWithProfile[]).map((prediction) => ({
    id: prediction.id,
    user_id: prediction.user_id,
    match_id: prediction.match_id,
    home_score: prediction.home_score,
    away_score: prediction.away_score,
    points_awarded: prediction.points_awarded,
    profile: normalizeProfile(prediction.profile),
  }));
}
