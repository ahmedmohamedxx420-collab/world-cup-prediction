#!/usr/bin/env node

// Maintenance script:
//   --list                       Print every account (username / full_name / is_admin).
//   --apply                      Delete the target accounts and promote bossbaby to admin.
//
// Targets to DELETE: full_name "admin" and "Ahmed Mohamed".
// Target to PROMOTE: username "bossbaby" -> profiles.is_admin = true.
//
// Without --apply the script only lists and reports what it WOULD do (dry run).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const DELETE_FULL_NAMES = ["admin", "ahmed mohamed"];
const PROMOTE_USERNAME = "bossbaby";

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

async function main() {
  const apply = process.argv.includes("--apply");

  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const supabase = createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const users = await listAllAuthUsers(supabase);
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, full_name, is_admin");
  if (profErr) throw profErr;
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const rows = users.map((u) => {
    const p = profileById.get(u.id);
    return {
      id: u.id,
      username: u.user_metadata?.username ?? "",
      email: u.email ?? "",
      full_name: p?.full_name ?? "",
      is_admin: p?.is_admin ?? false,
    };
  });

  console.log("=== All accounts ===");
  for (const r of rows) {
    console.log(
      `${r.is_admin ? "[ADMIN]" : "[     ]"} username="${r.username}" full_name="${r.full_name}" email="${r.email}"`,
    );
  }
  console.log("");

  const toDelete = rows.filter((r) =>
    DELETE_FULL_NAMES.includes(r.full_name.trim().toLowerCase()),
  );
  const toPromote = rows.filter(
    (r) => r.username.trim().toLowerCase() === PROMOTE_USERNAME,
  );

  console.log("=== Plan ===");
  console.log(`DELETE (${toDelete.length}):`);
  for (const r of toDelete) {
    console.log(`  - full_name="${r.full_name}" username="${r.username}" email="${r.email}"`);
  }
  console.log(`PROMOTE to admin (${toPromote.length}):`);
  for (const r of toPromote) {
    console.log(`  - username="${r.username}" full_name="${r.full_name}" email="${r.email}"`);
  }
  console.log("");

  if (toPromote.length === 0) {
    console.log(`WARNING: no account with username "${PROMOTE_USERNAME}" found.`);
  }

  if (!apply) {
    console.log("DRY RUN — re-run with --apply to execute.");
    return;
  }

  // Promote first, so we never end up with zero admins mid-run.
  for (const r of toPromote) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: true })
      .eq("id", r.id);
    if (error) throw error;
    console.log(`PROMOTED ${r.username} -> is_admin=true`);
  }

  for (const r of toDelete) {
    const { error } = await supabase.auth.admin.deleteUser(r.id);
    if (error) throw error;
    console.log(`DELETED ${r.full_name} (${r.email})`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
