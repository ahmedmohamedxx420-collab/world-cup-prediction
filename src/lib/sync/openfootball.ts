import "server-only";

// Thin client for the openfootball worldcup.json feed — a free, public, static
// JSON file on GitHub that covers the full 2026 schedule (all 104 matches),
// group assignments, the knockout bracket, and live full-time scores. Unlike a
// paid sports API there is no key or per-season plan, so it works for 2026 today.
//
// Override the URL via WORLDCUP_FEED_URL to pin a fork/mirror or test locally.
const FEED_URL =
  process.env.WORLDCUP_FEED_URL ??
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

// Score is present only once a match has been played. `ft` = full time, `ht` =
// half time, `p` = penalty shootout (knockout only). We read `ft` and `p`.
export type OfScore = {
  ft?: [number, number];
  ht?: [number, number];
  p?: [number, number];
};

export type OfMatch = {
  round: string; // "Matchday 1" (group) | "Round of 32" | … | "Final"
  num?: number; // official FIFA match # — present ONLY on the 32 knockout matches
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM UTC-6" (local kickoff with offset)
  team1: string; // real name ("Mexico") or knockout placeholder ("2A", "W74")
  team2: string;
  group?: string; // "Group A" — present ONLY on the 72 group matches
  ground?: string; // venue city
  score?: OfScore;
};

export async function fetchWorldCup(): Promise<OfMatch[]> {
  const res = await fetch(FEED_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`openfootball feed → HTTP ${res.status}`);
  const json = (await res.json()) as { matches?: OfMatch[] };
  return json.matches ?? [];
}
