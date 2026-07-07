#!/usr/bin/env node

// One-off maintenance script: add three predictions for "Mr. Boss Baby" for the
// matches played yesterday/today (2026-07-03 .. 2026-07-04), without touching
// anyone else's data.
//
// Because the scoring trigger (0006_scoring.sql) only fires when a *match* score
// is written, a prediction inserted after a match has already finished would
// otherwise keep points_awarded = null and be ignored by the leaderboard. So,
// matching seed-demo.mjs / add-single-prediction.mjs, we compute points_awarded
// here at insert time for finished matches. For a match with no score yet, we
// insert points_awarded = null on purpose: when the admin later writes that
// match's score, score_match() recomputes points for every prediction on it,
// including this one.
//
//   node scripts/add-boss-baby-predictions.mjs            # dry run: report only
//   node scripts/add-boss-baby-predictions.mjs --apply    # actually write rows
//
// Picks (each "team wins winGoals-loseGoals"):
//   Egypt     win 2-1   (yesterday: Australia vs Egypt)
//   Argentina win 3-1   (yesterday: Argentina vs Cape Verde)
//   Colombia  win 2-1   (today:     Colombia vs Ghana — opponent asserted)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const TARGET_USER_NAME = "Mr. Boss Baby";

// Only consider matches kicking off in this window, so a team's other group
// games can't accidentally match. Half-open [from, to).
const WINDOW_FROM = "2026-07-03T00:00:00.000Z";
const WINDOW_TO = "2026-07-05T00:00:00.000Z";

const PICKS = [
  { team: "egypt", winGoals: 2, loseGoals: 1 },
  { team: "argentina", winGoals: 3, loseGoals: 1 },
  { team: "colombia", opponent: "ghana", winGoals: 2, loseGoals: 1 },
];

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
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[m[1]] = value;
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

  // 1) Find the user by full name (exact, case-insensitive, trimmed).
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, full_name");
  if (profErr) throw profErr;

  const needle = TARGET_USER_NAME.trim().toLowerCase();
  const userMatches = profiles.filter(
    (p) => (p.full_name ?? "").trim().toLowerCase() === needle,
  );
  console.log(`Profiles exactly matching "${TARGET_USER_NAME}": ${userMatches.length}`);
  for (const p of userMatches) console.log(`  - full_name="${p.full_name}" id=${p.id}`);
  if (userMatches.length !== 1) {
    throw new Error(
      userMatches.length === 0
        ? "No profile matched — check the name."
        : "Multiple profiles matched — refine TARGET_USER_NAME.",
    );
  }
  const user = userMatches[0];

  // 2) Load teams + the matches in the target window.
  const { data: teams, error: teamsErr } = await supabase
    .from("teams")
    .select("id, name_en, name_ar, code");
  if (teamsErr) throw teamsErr;
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const { data: windowMatches, error: matchesErr } = await supabase
    .from("matches")
    .select(
      "id, home_team_id, away_team_id, kickoff_at, status, home_score, away_score",
    )
    .gte("kickoff_at", WINDOW_FROM)
    .lt("kickoff_at", WINDOW_TO);
  if (matchesErr) throw matchesErr;

  // 3) Settings for point computation.
  const { data: settings, error: settingsErr } = await supabase
    .from("app_settings")
    .select("exact_points, goal_diff_points, winner_points")
    .eq("id", 1)
    .single();
  if (settingsErr) throw settingsErr;

  // 4) Resolve each pick to a concrete fixture + home/away mapped goals.
  const plans = [];
  for (const pick of PICKS) {
    const fixtures = windowMatches.filter((m) => {
      const home = teamById.get(m.home_team_id);
      const away = teamById.get(m.away_team_id);
      return teamMatches(home, pick.team) || teamMatches(away, pick.team);
    });
    if (fixtures.length !== 1) {
      throw new Error(
        `Expected exactly one window fixture for "${pick.team}", found ${fixtures.length}.`,
      );
    }
    const match = fixtures[0];
    const home = teamById.get(match.home_team_id);
    const away = teamById.get(match.away_team_id);

    // Sanity-check the opponent when the caller specified one.
    if (pick.opponent) {
      const otherIsOpponent =
        (teamMatches(home, pick.team) && teamMatches(away, pick.opponent)) ||
        (teamMatches(away, pick.team) && teamMatches(home, pick.opponent));
      if (!otherIsOpponent) {
        throw new Error(
          `Fixture ${match.id} is not ${pick.team} vs ${pick.opponent}.`,
        );
      }
    }

    const homeIsWinner = teamMatches(home, pick.team);
    const predHome = homeIsWinner ? pick.winGoals : pick.loseGoals;
    const predAway = homeIsWinner ? pick.loseGoals : pick.winGoals;
    const points = scorePoints(
      { home_score: predHome, away_score: predAway },
      match,
      settings,
    );

    plans.push({ pick, match, home, away, predHome, predAway, points });
  }

  // 5) Guard against clobbering existing predictions.
  const matchIds = plans.map((p) => p.match.id);
  const { data: existing, error: existErr } = await supabase
    .from("predictions")
    .select("id, match_id, home_score, away_score, points_awarded")
    .eq("user_id", user.id)
    .in("match_id", matchIds);
  if (existErr) throw existErr;
  const existingByMatch = new Map(existing.map((e) => [e.match_id, e]));

  console.log(`\n=== Plan for ${user.full_name} ===`);
  const toInsert = [];
  for (const p of plans) {
    console.log(
      `\nFixture id=${p.match.id}: ${p.home?.name_en} (home) vs ${p.away?.name_en} (away)`,
    );
    console.log(
      `  kickoff=${p.match.kickoff_at} status=${p.match.status} ` +
        `actual=${p.match.home_score ?? "-"}:${p.match.away_score ?? "-"}`,
    );
    console.log(
      `  Prediction: ${p.home?.name_en} ${p.predHome} - ${p.predAway} ${p.away?.name_en} ` +
        `(home ${p.predHome} : away ${p.predAway})`,
    );
    console.log(
      `  Points: ${p.points === null ? "null (match not finished — scored later)" : p.points}`,
    );
    const ex = existingByMatch.get(p.match.id);
    if (ex) {
      const same = ex.home_score === p.predHome && ex.away_score === p.predAway;
      console.log(
        `  SKIP: prediction already exists (${ex.home_score}:${ex.away_score} ` +
          `points=${ex.points_awarded})` +
          (same ? " — identical to requested pick." : " — DIFFERS; leaving as-is, not overwriting."),
      );
      if (!same) {
        throw new Error(
          `Existing prediction on match ${p.match.id} DIFFERS from requested ` +
            `pick (${ex.home_score}:${ex.away_score} vs ${p.predHome}:${p.predAway}). ` +
            `Refusing to proceed — resolve manually.`,
        );
      }
      continue;
    }
    toInsert.push(p);
  }

  if (toInsert.length === 0) {
    console.log("\nNothing to insert — all requested predictions already exist.");
    return;
  }

  if (!apply) {
    console.log(
      `\nDRY RUN — ${toInsert.length} prediction(s) to insert. ` +
        `Re-run with --apply to write them.`,
    );
    return;
  }

  const nowIso = new Date().toISOString();
  const rows = toInsert.map((p) => ({
    user_id: user.id,
    match_id: p.match.id,
    home_score: p.predHome,
    away_score: p.predAway,
    points_awarded: p.points,
    created_at: nowIso,
    updated_at: nowIso,
  }));

  const { data: inserted, error: insertErr } = await supabase
    .from("predictions")
    .insert(rows)
    .select("id, match_id, home_score, away_score, points_awarded");
  if (insertErr) throw insertErr;

  console.log(`\nINSERTED ${inserted.length} predictions:`);
  for (const r of inserted) {
    console.log(
      `  id=${r.id} match=${r.match_id} ${r.home_score}:${r.away_score} points=${r.points_awarded}`,
    );
  }
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
