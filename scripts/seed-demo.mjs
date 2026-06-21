#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD ?? "DemoPass2026!";

const DEMO_USERS = [
  { email: "maya.demo@example.com", fullName: "Maya Demo", skill: 0.86 },
  { email: "omar.demo@example.com", fullName: "Omar Demo", skill: 0.8 },
  { email: "lina.demo@example.com", fullName: "Lina Demo", skill: 0.76 },
  { email: "youssef.demo@example.com", fullName: "Youssef Demo", skill: 0.72 },
  { email: "noura.demo@example.com", fullName: "Noura Demo", skill: 0.68 },
  { email: "khalid.demo@example.com", fullName: "Khalid Demo", skill: 0.64 },
  { email: "sara.demo@example.com", fullName: "Sara Demo", skill: 0.6 },
  { email: "faris.demo@example.com", fullName: "Faris Demo", skill: 0.56 },
  { email: "hana.demo@example.com", fullName: "Hana Demo", skill: 0.52 },
  { email: "adam.demo@example.com", fullName: "Adam Demo", skill: 0.48 },
  { email: "layla.demo@example.com", fullName: "Layla Demo", skill: 0.44 },
  { email: "ziad.demo@example.com", fullName: "Ziad Demo", skill: 0.4 },
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
  if (!value) {
    throw new Error(`${name} is not configured. Check .env.local.`);
  }

  return value;
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function rngFor(seed) {
  let state = hashString(seed);
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickInt(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

function clampScore(value) {
  return Math.max(0, Math.min(8, value));
}

function tendency(homeScore, awayScore) {
  return Math.sign(homeScore - awayScore);
}

function scorePrediction(prediction, match, settings) {
  if (
    prediction.home_score === match.home_score &&
    prediction.away_score === match.away_score
  ) {
    return settings.exact_points;
  }

  if (
    prediction.home_score - prediction.away_score ===
    match.home_score - match.away_score
  ) {
    return settings.goal_diff_points;
  }

  if (
    tendency(prediction.home_score, prediction.away_score) ===
    tendency(match.home_score, match.away_score)
  ) {
    return settings.winner_points;
  }

  return 0;
}

function marginPrediction(match, random) {
  const diff = match.home_score - match.away_score;

  if (diff === 0) {
    const score = match.home_score === 1 ? 2 : 1;
    return { home_score: score, away_score: score };
  }

  if (diff > 0) {
    const away = pickInt(random, 0, Math.max(0, 8 - diff));
    const home = away + diff;
    if (home === match.home_score && away === match.away_score) {
      return { home_score: clampScore(home - 1), away_score: clampScore(away - 1) };
    }
    return { home_score: home, away_score: away };
  }

  const home = pickInt(random, 0, Math.max(0, 8 + diff));
  const away = home - diff;
  if (home === match.home_score && away === match.away_score) {
    return { home_score: clampScore(home - 1), away_score: clampScore(away - 1) };
  }
  return { home_score: home, away_score: away };
}

function winnerPrediction(match, random) {
  const actualTendency = tendency(match.home_score, match.away_score);
  const actualDiff = Math.abs(match.home_score - match.away_score);
  let diff = pickInt(random, 1, 3);

  if (diff === actualDiff) {
    diff = diff === 3 ? 1 : diff + 1;
  }

  if (actualTendency > 0) {
    const away = pickInt(random, 0, 2);
    return { home_score: away + diff, away_score: away };
  }

  if (actualTendency < 0) {
    const home = pickInt(random, 0, 2);
    return { home_score: home, away_score: home + diff };
  }

  return marginPrediction(match, random);
}

function missPrediction(match, random) {
  const actualTendency = tendency(match.home_score, match.away_score);
  const low = pickInt(random, 0, 2);
  const high = low + pickInt(random, 1, 3);

  if (actualTendency > 0) {
    return { home_score: low, away_score: high };
  }

  if (actualTendency < 0) {
    return { home_score: high, away_score: low };
  }

  return random() > 0.5
    ? { home_score: high, away_score: low }
    : { home_score: low, away_score: high };
}

function predictionFor(match, demoUser, userIndex) {
  const random = rngFor(`${demoUser.email}:${match.id}`);
  const exactRate = 0.08 + demoUser.skill * 0.15;
  const marginRate = 0.12 + demoUser.skill * 0.18;
  const winnerRate = 0.22 + demoUser.skill * 0.22;
  const roll = random();

  if (roll < exactRate) {
    return { home_score: match.home_score, away_score: match.away_score };
  }

  if (roll < exactRate + marginRate) {
    return marginPrediction(match, random);
  }

  if (roll < exactRate + marginRate + winnerRate) {
    return winnerPrediction(match, random);
  }

  const miss = missPrediction(match, random);
  if (userIndex % 4 === 0 && match.home_score + match.away_score >= 4) {
    return {
      home_score: clampScore(miss.home_score + 1),
      away_score: clampScore(miss.away_score + 1),
    };
  }

  return miss;
}

function predictionTimestamp(match, demoUser) {
  const random = rngFor(`time:${demoUser.email}:${match.id}`);
  const kickoff = new Date(match.kickoff_at).getTime();
  const leadHours = pickInt(random, 10, 96);
  const leadMinutes = pickInt(random, 0, 59);
  const createdAt = new Date(kickoff - (leadHours * 60 + leadMinutes) * 60_000);

  return createdAt.toISOString();
}

async function listAllAuthUsers(supabase) {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;

    users.push(...data.users);
    if (data.users.length < 1000) break;
    page += 1;
  }

  return users;
}

async function upsertDemoUsers(supabase) {
  const existingUsers = await listAllAuthUsers(supabase);
  const usersByEmail = new Map(
    existingUsers
      .filter((user) => user.email)
      .map((user) => [user.email.toLowerCase(), user]),
  );

  const seededUsers = [];
  let createdCount = 0;
  let updatedCount = 0;

  for (const demoUser of DEMO_USERS) {
    const existing = usersByEmail.get(demoUser.email);

    if (existing) {
      const { data, error } = await supabase.auth.admin.updateUserById(
        existing.id,
        {
          password: DEMO_PASSWORD,
          user_metadata: {
            ...(existing.user_metadata ?? {}),
            demo_seed: true,
            full_name: demoUser.fullName,
          },
        },
      );
      if (error) throw error;

      seededUsers.push({ ...demoUser, id: data.user.id });
      updatedCount += 1;
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: demoUser.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        demo_seed: true,
        full_name: demoUser.fullName,
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error(`Failed to create ${demoUser.email}`);

    seededUsers.push({ ...demoUser, id: data.user.id });
    createdCount += 1;
  }

  const profileRows = seededUsers.map((user, index) => ({
    id: user.id,
    full_name: user.fullName,
    avatar_url: null,
    is_admin: false,
    locale: index % 3 === 0 ? "en" : "ar",
    password_reset_pending: false,
  }));

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profileRows, { onConflict: "id" });
  if (profileError) throw profileError;

  return { seededUsers, createdCount, updatedCount };
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const supabase = createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const now = new Date().toISOString();
  const { data: settings, error: settingsError } = await supabase
    .from("app_settings")
    .select("exact_points, goal_diff_points, winner_points")
    .eq("id", 1)
    .single();
  if (settingsError) throw settingsError;

  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select(
      "id, kickoff_at, home_team_id, away_team_id, home_score, away_score, status",
    )
    .lt("kickoff_at", now)
    .eq("status", "finished")
    .not("home_team_id", "is", null)
    .not("away_team_id", "is", null)
    .not("home_score", "is", null)
    .not("away_score", "is", null)
    .order("kickoff_at", { ascending: true });
  if (matchesError) throw matchesError;

  if (!matches?.length) {
    throw new Error("No finished past matches found. Sync fixtures/results first.");
  }

  const { seededUsers, createdCount, updatedCount } =
    await upsertDemoUsers(supabase);

  const predictionRows = [];
  for (const [userIndex, user] of seededUsers.entries()) {
    for (const match of matches) {
      const prediction = predictionFor(match, user, userIndex);
      const createdAt = predictionTimestamp(match, user);

      predictionRows.push({
        user_id: user.id,
        match_id: match.id,
        home_score: prediction.home_score,
        away_score: prediction.away_score,
        points_awarded: scorePrediction(prediction, match, settings),
        created_at: createdAt,
        updated_at: createdAt,
      });
    }
  }

  const { error: predictionError } = await supabase
    .from("predictions")
    .upsert(predictionRows, { onConflict: "user_id,match_id" });
  if (predictionError) throw predictionError;

  console.log(
    [
      "Demo seed complete.",
      `Users: ${createdCount} created, ${updatedCount} updated.`,
      `Profiles upserted: ${seededUsers.length}.`,
      `Finished past matches used: ${matches.length}.`,
      `Predictions upserted: ${predictionRows.length}.`,
      `Demo password: ${DEMO_PASSWORD}`,
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
