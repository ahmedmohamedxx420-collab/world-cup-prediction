#!/usr/bin/env node

// One-off maintenance script:
//   1. Delete every prediction belonging to real (non-demo) users — resets their "bets".
//   2. Delete all demo seed users (user_metadata.demo_seed === true). This cascades
//      to their profiles and predictions via the on-delete-cascade FKs.
//
// Net effect: the predictions table is emptied and all demo accounts are removed,
// while real user accounts (and their profiles) stay intact.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

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

function isDemo(user) {
  return (
    user.user_metadata?.demo_seed === true ||
    (user.email ?? "").toLowerCase().endsWith(".demo@example.com")
  );
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const supabase = createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const allUsers = await listAllAuthUsers(supabase);
  const demoUsers = allUsers.filter(isDemo);
  const realUsers = allUsers.filter((user) => !isDemo(user));

  console.log(
    `Found ${allUsers.length} auth users — ${demoUsers.length} demo, ${realUsers.length} real.`,
  );

  // 1) Reset real users' predictions (delete their bets).
  const realIds = realUsers.map((user) => user.id);
  let deletedPredictions = 0;
  const chunkSize = 100;
  for (let i = 0; i < realIds.length; i += chunkSize) {
    const chunk = realIds.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from("predictions")
      .delete()
      .in("user_id", chunk)
      .select("id");
    if (error) throw error;
    deletedPredictions += data?.length ?? 0;
  }
  console.log(`Deleted ${deletedPredictions} predictions from real users.`);

  // 2) Delete demo users (cascades their profiles + predictions).
  let deletedDemo = 0;
  for (const user of demoUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw error;
    deletedDemo += 1;
  }
  console.log(`Deleted ${deletedDemo} demo users (profiles + predictions cascaded).`);

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
