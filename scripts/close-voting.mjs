#!/usr/bin/env node

// One-off maintenance script: close the prediction/voting window for a single
// match immediately by setting its kickoff_at to now.
//
// Voting is gated by matches.kickoff_at (see 0003_core_rls.sql): members can
// INSERT/UPDATE a prediction only while now() < kickoff_at, and predictions
// become visible once now() >= kickoff_at. Setting kickoff_at to the current
// moment therefore closes voting and reveals predictions right away.
//
//   node scripts/close-voting.mjs            # dry run: report only
//   node scripts/close-voting.mjs --apply    # actually close voting now
//
// Target (edit these to change the fixture):
//   Match : Portugal vs Spain (matched on team names, either side)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const TEAM_A = "portugal";
const TEAM_B = "spain";

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

  const { data: teams, error: teamsErr } = await supabase
    .from("teams")
    .select("id, name_en, name_ar, code");
  if (teamsErr) throw teamsErr;
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const { data: matches, error: matchesErr } = await supabase
    .from("matches")
    .select("id, home_team_id, away_team_id, kickoff_at, status");
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
        `kickoff=${m.kickoff_at} status=${m.status}`,
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

  const now = new Date();
  const nowIso = now.toISOString();

  console.log("\n=== Plan ===");
  console.log(
    `Fixture : ${home?.name_en} (home) vs ${away?.name_en} (away), id=${match.id}`,
  );
  console.log(`Current : kickoff_at=${match.kickoff_at} status=${match.status}`);
  console.log(`New     : kickoff_at=${nowIso} (voting closed immediately)`);

  if (new Date(match.kickoff_at) <= now) {
    console.log("\nVoting is already closed (kickoff_at is in the past).");
    if (!apply) return;
  }

  if (!apply) {
    console.log("\nDRY RUN — re-run with --apply to close voting now.");
    return;
  }

  const { data: updated, error: updateErr } = await supabase
    .from("matches")
    .update({ kickoff_at: nowIso })
    .eq("id", match.id)
    .select("id, status, kickoff_at")
    .single();
  if (updateErr) throw updateErr;

  console.log(
    `\nUPDATED match id=${updated.id} ` +
      `kickoff_at=${updated.kickoff_at} status=${updated.status}`,
  );
  console.log("Voting is now closed; predictions are visible. Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
