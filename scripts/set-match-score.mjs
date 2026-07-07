#!/usr/bin/env node

// One-off maintenance script: set the final score for a single match.
//
// Writing matches.home_score/away_score fires the DB triggers from
// 0006_scoring.sql: the match is marked finished and points_awarded is
// (re)computed for every prediction on it. Idempotent — safe to re-run to
// correct a score.
//
//   node scripts/set-match-score.mjs            # dry run: report only
//   node scripts/set-match-score.mjs --apply    # actually write the score
//
// Target (edit these to change the fixture/score):
//   Match : Belgium vs Senegal (matched on team names, either side)
//   Score : Belgium 3 - 2 Senegal (mapped to home/away from the fixture)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const TEAM_A = "belgium";
const TEAM_B = "senegal";
// Final goals keyed by the team, so home/away is derived from the fixture.
const FINAL_GOALS = { [TEAM_A]: 3, [TEAM_B]: 2 };

function loadEnvFile(fileName) {
  let contents;
  try {
    contents = readFileSync(resolve(process.cwd(), fileName), "utf8");
  } catch {
    return;
  }
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured. Check .env.local.`);
  return value;
}

function teamMatches(team, needle) {
  if (!team) return false;
  const hay = `${team.name_en ?? ""} ${team.name_ar ?? ""} ${team.code ?? ""}`
    .toLowerCase();
  return hay.includes(needle);
}

async function main() {
  const apply = process.argv.includes("--apply");

  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const supabase = createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // 1) Load teams + find the Belgium vs Senegal match.
  const { data: teams, error: teamsErr } = await supabase
    .from("teams")
    .select("id, name_en, name_ar, code");
  if (teamsErr) throw teamsErr;
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const { data: matches, error: matchesErr } = await supabase
    .from("matches")
    .select(
      "id, home_team_id, away_team_id, kickoff_at, status, home_score, away_score",
    );
  if (matchesErr) throw matchesErr;

  const fixtureMatches = matches.filter((m) => {
    const home = teamById.get(m.home_team_id);
    const away = teamById.get(m.away_team_id);
    const aOnHome = teamMatches(home, TEAM_A) && teamMatches(away, TEAM_B);
    const aOnAway = teamMatches(home, TEAM_B) && teamMatches(away, TEAM_A);
    return aOnHome || aOnAway;
  });

  console.log(`Matches for ${TEAM_A} vs ${TEAM_B}: ${fixtureMatches.length}`);
  for (const m of fixtureMatches) {
    const home = teamById.get(m.home_team_id);
    const away = teamById.get(m.away_team_id);
    console.log(
      `  - id=${m.id} ${home?.name_en} vs ${away?.name_en} | ` +
        `kickoff=${m.kickoff_at} status=${m.status} ` +
        `score=${m.home_score ?? "-"}:${m.away_score ?? "-"}`,
    );
  }
  if (fixtureMatches.length !== 1) {
    throw new Error(
      fixtureMatches.length === 0
        ? "No matching fixture found — check team names."
        : "Multiple fixtures matched — refine team names.",
    );
  }
  const match = fixtureMatches[0];
  const home = teamById.get(match.home_team_id);
  const away = teamById.get(match.away_team_id);

  // 2) Map the per-team final goals onto this fixture's home/away.
  const homeIsA = teamMatches(home, TEAM_A);
  const homeScore = homeIsA ? FINAL_GOALS[TEAM_A] : FINAL_GOALS[TEAM_B];
  const awayScore = homeIsA ? FINAL_GOALS[TEAM_B] : FINAL_GOALS[TEAM_A];

  console.log("\n=== Plan ===");
  console.log(
    `Fixture : ${home?.name_en} (home) vs ${away?.name_en} (away), id=${match.id}`,
  );
  console.log(
    `Current : ${match.home_score ?? "-"}:${match.away_score ?? "-"} (status=${match.status})`,
  );
  console.log(
    `New     : ${home?.name_en} ${homeScore} - ${awayScore} ${away?.name_en}  (home ${homeScore} : away ${awayScore})`,
  );

  if (
    match.home_score === homeScore &&
    match.away_score === awayScore &&
    match.status === "finished"
  ) {
    console.log("\nAlready set to this score — nothing to do.");
    return;
  }

  if (!apply) {
    console.log("\nDRY RUN — re-run with --apply to write this score.");
    return;
  }

  const { data: updated, error: updateErr } = await supabase
    .from("matches")
    .update({ home_score: homeScore, away_score: awayScore })
    .eq("id", match.id)
    .select("id, status, home_score, away_score")
    .single();
  if (updateErr) throw updateErr;

  console.log(
    `\nUPDATED match id=${updated.id} ` +
      `${updated.home_score}:${updated.away_score} status=${updated.status}`,
  );

  // Report the rescored predictions so the effect is visible.
  const { data: preds, error: predsErr } = await supabase
    .from("predictions")
    .select("user_id, home_score, away_score, points_awarded")
    .eq("match_id", match.id);
  if (predsErr) throw predsErr;

  console.log(`\nPredictions on this match: ${preds.length}`);
  const tally = {};
  for (const p of preds) {
    const key = String(p.points_awarded);
    tally[key] = (tally[key] ?? 0) + 1;
  }
  for (const [pts, count] of Object.entries(tally)) {
    console.log(`  points=${pts}: ${count}`);
  }
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
