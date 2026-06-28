#!/usr/bin/env node

// One-off fix: accounts created before the username-login migration still have
// real email addresses (e.g. someone@gmail.com). The current login form only
// authenticates against synthetic `<username>@users.local` emails, so those
// accounts can never log in. This rebinds each real-email account's auth email
// to a synthetic username email derived from the email's local-part.
//
// Passwords are NOT changed. After this runs, each user logs in with their
// derived username + their existing password.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const SYNTHETIC_DOMAIN = "users.local";
const MIN = 4;
const MAX = 20;

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

// Derive a valid username from an email's local-part: lowercase, keep [a-z0-9],
// pad/truncate to the 4..20 length window.
function deriveUsername(email) {
  const local = email.split("@")[0].toLowerCase();
  let u = local.replace(/[^a-z0-9]/g, "");
  if (u.length > MAX) u = u.slice(0, MAX);
  return u;
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
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const supabase = createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const users = await listAllAuthUsers(supabase);
  const existingEmails = new Set(
    users.map((u) => (u.email ?? "").toLowerCase()).filter(Boolean),
  );

  // Targets: any account whose email is NOT already a synthetic users.local one.
  const targets = users.filter(
    (u) => u.email && !u.email.toLowerCase().endsWith(`@${SYNTHETIC_DOMAIN}`),
  );

  console.log(`Found ${targets.length} accounts with non-synthetic emails.`);

  for (const user of targets) {
    const username = deriveUsername(user.email);
    if (username.length < MIN) {
      console.log(`SKIP ${user.email} — derived username "${username}" too short.`);
      continue;
    }
    const newEmail = `${username}@${SYNTHETIC_DOMAIN}`;
    if (existingEmails.has(newEmail)) {
      console.log(`SKIP ${user.email} — ${newEmail} already taken.`);
      continue;
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      email: newEmail,
      email_confirm: true,
      user_metadata: { ...(user.user_metadata ?? {}), username },
    });
    if (error) {
      console.log(`ERROR ${user.email} -> ${newEmail}: ${error.message}`);
      continue;
    }

    existingEmails.add(newEmail);
    console.log(`OK ${user.email} -> ${newEmail} (login username: ${username})`);
  }

  console.log("Done. Passwords were not changed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
