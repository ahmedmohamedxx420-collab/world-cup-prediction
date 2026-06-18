import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AppSettings = {
  exact_points: number;
  goal_diff_points: number;
  winner_points: number;
};

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("exact_points, goal_diff_points, winner_points")
    .eq("id", 1)
    .single();

  if (error) throw error;

  return data as AppSettings;
}
