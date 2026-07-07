#!/usr/bin/env node

// One-off maintenance script: reopen the prediction/voting window for a single
// match by pushing its kickoff_at forward.
//
// Voting is gated by matches.kickoff_at (see 0003_core_rls.sql): members can
// INSERT/UPDATE a prediction only while now() < kickoff_at, and predictions
// stay hidden until now() >= kickoff_at. So setting kickoff_at to a few minutes
// from now reopens voting for exactly that window (and re-hides predictions
// until it closes again).
//
//   node scripts/extend-voting-window.mjs            # dry run: report only
//   node scripts/extend-voting-window.mjs --apply    # actually move kickoff_at
//
// Target (edit these to change the fixture/window):
//   Match  : Portugal vs Spain (matched on team names, either side)
//   Window : 15 minutes from the moment --apply runs

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const TEAM_A = "portugal";
const TEAM_B = "spain";
const WINDOW_MINUTES = 3;

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

  // 1) Load teams + find the Portugal vs Spain match.
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

  // 2) Compute the new kickoff (= new voting cutoff). Extend from wherever the
  // window currently stands: if the current cutoff is still in the future, add
  // WINDOW_MINUTES on top of it; otherwise open a fresh window from now.
  const base = Math.max(Date.now(), new Date(match.kickoff_at).getTime());
  const newKickoff = new Date(base + WINDOW_MINUTES * 60 * 1000);
  const newKickoffIso = newKickoff.toISOString();

  console.log("\n=== Plan ===");
  console.log(
    `Fixture : ${home?.name_en} (home) vs ${away?.name_en} (away), id=${match.id}`,
  );
  console.log(`Current : kickoff_at=${match.kickoff_at} status=${match.status}`);
  console.log(
    `New     : kickoff_at=${newKickoffIso} (voting open for ~${WINDOW_MINUTES} min)`,
  );

  if (match.status === "finished") {
    console.log(
      "\nWARNING: match status is 'finished'. Reopening voting on a finished " +
        "match may be inconsistent — double-check this is the right fixture.",
    );
  }

  if (!apply) {
    console.log("\nDRY RUN — re-run with --apply to move the kickoff time.");
    return;
  }

  const { data: updated, error: updateErr } = await supabase
    .from("matches")
    .update({ kickoff_at: newKickoffIso })
    .eq("id", match.id)
    .select("id, status, kickoff_at")
    .single();
  if (updateErr) throw updateErr;

  console.log(
    `\nUPDATED match id=${updated.id} ` +
      `kickoff_at=${updated.kickoff_at} status=${updated.status}`,
  );
  console.log(
    `Voting is open until ${newKickoffIso} ` +
      `(local: ${newKickoff.toLocaleString()}).`,
  );
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
