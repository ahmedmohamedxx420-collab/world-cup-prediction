import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Team = {
  id: number;
  name_en: string;
  name_ar: string;
  code: string;
  flag: string | null;
  group_letter: string | null;
};

const TEAM_COLUMNS = "id, name_en, name_ar, code, flag, group_letter";

export async function listTeams(): Promise<Team[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select(TEAM_COLUMNS)
    .order("group_letter", { ascending: true, nullsFirst: false })
    .order("name_en", { ascending: true });

  if (error) throw error;

  return (data ?? []) as Team[];
}

export async function getTeam(id: number): Promise<Team | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select(TEAM_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return (data as Team | null) ?? null;
}
