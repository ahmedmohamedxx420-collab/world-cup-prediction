#!/usr/bin/env node

// One-off maintenance script: add a single prediction for one user who forgot
// to vote, without touching anyone else's data.
//
// Because the scoring trigger (0006_scoring.sql) only fires when a *match* score
// is written, inserting a prediction after a match has already finished would
// leave points_awarded = null and the pick would be ignored by the leaderboard.
// So, matching seed-demo.mjs, we compute points_awarded here at insert time.
//
//   node scripts/add-single-prediction.mjs            # dry run: report only
//   node scripts/add-single-prediction.mjs --apply    # actually write the row
//
// Target (edit these to change the pick):
//   User full name : حمود  (matched case-insensitively, trimmed, substring)
//   Match          : England vs Congo (matched on team names, either side)
//   Prediction     : England 2 - 1 Congo (mapped to home/away from the fixture)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const TARGET_USER_NAME = "حمود";
const TEAM_A = "england";
const TEAM_B = "congo";
// Predicted goals keyed by the team, so home/away is derived from the fixture.
const PREDICTED_GOALS = { [TEAM_A]: 2, [TEAM_B]: 1 };

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

function scorePoints(pred, match, settings) {
  if (match.home_score == null || match.away_score == null) return null;
  const { home_score: ph, away_score: pa } = pred;
  const { home_score: ah, away_score: aa } = match;
  if (ph === ah && pa === aa) return settings.exact_points;
  if (ph - pa === ah - aa) return settings.goal_diff_points;
  if (Math.sign(ph - pa) === Math.sign(ah - aa)) return settings.winner_points;
  return 0;
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

  // 1) Find the user by full name.
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, full_name");
  if (profErr) throw profErr;

  const needle = TARGET_USER_NAME.trim().toLowerCase();
  const userMatches = profiles.filter((p) =>
    (p.full_name ?? "").trim().toLowerCase().includes(needle),
  );

  console.log(`Profiles matching "${TARGET_USER_NAME}": ${userMatches.length}`);
  for (const p of userMatches) {
    console.log(`  - full_name="${p.full_name}" id=${p.id}`);
  }
  if (userMatches.length !== 1) {
    throw new Error(
      userMatches.length === 0
        ? "No profile matched — check the name."
        : "Multiple profiles matched — refine TARGET_USER_NAME.",
    );
  }
  const user = userMatches[0];

  // 2) Load teams + find the England vs Congo match.
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

  console.log(`\nMatches for ${TEAM_A} vs ${TEAM_B}: ${fixtureMatches.length}`);
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

  // 3) Map the per-team predicted goals onto this fixture's home/away.
  const homeIsA = teamMatches(home, TEAM_A);
  const predHome = homeIsA ? PREDICTED_GOALS[TEAM_A] : PREDICTED_GOALS[TEAM_B];
  const predAway = homeIsA ? PREDICTED_GOALS[TEAM_B] : PREDICTED_GOALS[TEAM_A];

  // 4) Settings + points.
  const { data: settings, error: settingsErr } = await supabase
    .from("app_settings")
    .select("exact_points, goal_diff_points, winner_points")
    .eq("id", 1)
    .single();
  if (settingsErr) throw settingsErr;

  const pred = { home_score: predHome, away_score: predAway };
  const points = scorePoints(pred, match, settings);

  // 5) Guard against clobbering an existing prediction.
  const { data: existing, error: existErr } = await supabase
    .from("predictions")
    .select("id, home_score, away_score, points_awarded")
    .eq("user_id", user.id)
    .eq("match_id", match.id)
    .maybeSingle();
  if (existErr) throw existErr;

  console.log("\n=== Plan ===");
  console.log(`User      : ${user.full_name} (${user.id})`);
  console.log(
    `Fixture   : ${home?.name_en} (home) vs ${away?.name_en} (away), id=${match.id}`,
  );
  console.log(
    `Actual    : ${match.home_score ?? "-"}:${match.away_score ?? "-"} (status=${match.status})`,
  );
  console.log(
    `Prediction: ${home?.name_en} ${predHome} - ${predAway} ${away?.name_en}  (home ${predHome} : away ${predAway})`,
  );
  console.log(`Points    : ${points === null ? "null (match not finished)" : points}`);

  if (existing) {
    console.log(
      `\nWARNING: a prediction ALREADY exists for this user+match: ` +
        `${existing.home_score}:${existing.away_score} points=${existing.points_awarded}. ` +
        `Aborting so nothing is overwritten.`,
    );
    throw new Error("Prediction already exists — refusing to overwrite.");
  }

  if (!apply) {
    console.log("\nDRY RUN — re-run with --apply to write this prediction.");
    return;
  }

  const nowIso = new Date().toISOString();
  const { data: inserted, error: insertErr } = await supabase
    .from("predictions")
    .insert({
      user_id: user.id,
      match_id: match.id,
      home_score: predHome,
      away_score: predAway,
      points_awarded: points,
      created_at: nowIso,
      updated_at: nowIso,
    })
    .select("id, home_score, away_score, points_awarded")
    .single();
  if (insertErr) throw insertErr;

  console.log(
    `\nINSERTED prediction id=${inserted.id} ` +
      `${inserted.home_score}:${inserted.away_score} points=${inserted.points_awarded}`,
  );
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
