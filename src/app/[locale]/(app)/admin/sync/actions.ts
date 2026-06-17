"use server";

import { revalidatePath } from "next/cache";
import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/profile";
import { syncSchedule, syncResults } from "@/lib/sync/world-cup";

export type SyncActionState = {
  count?: number;
  error?: "generic";
  ok?: boolean;
  toastId?: string;
};

async function resolveLocale() {
  const requested = await getLocale();
  return hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
}

// Run a sync and log the outcome to sync_runs (failures are recorded, not thrown,
// so the /admin/sync page can show the error on the next render).
async function recordRun(
  kind: "schedule" | "results",
  run: () => Promise<{ fixtures: number }>,
): Promise<SyncActionState> {
  const admin = createAdminClient();
  try {
    const result = await run();
    await admin
      .from("sync_runs")
      .insert({ kind, ok: true, fixtures_upserted: result.fixtures });
    return { ok: true, count: result.fixtures, toastId: `${kind}-${Date.now()}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await admin.from("sync_runs").insert({ kind, ok: false, error: message });
    return { ok: false, error: "generic", toastId: `${kind}-${Date.now()}` };
  }
}

export async function runFullSync(
  _previousState: SyncActionState,
): Promise<SyncActionState> {
  void _previousState;

  const profile = await getProfile();
  const locale = await resolveLocale();
  if (!profile?.is_admin) {
    redirect({ href: "/fixtures", locale });
    return {};
  }
  const state = await recordRun("schedule", syncSchedule);
  revalidatePath(`/${locale}/admin/sync`);
  return state;
}

export async function runResultsSync(
  _previousState: SyncActionState,
): Promise<SyncActionState> {
  void _previousState;

  const profile = await getProfile();
  const locale = await resolveLocale();
  if (!profile?.is_admin) {
    redirect({ href: "/fixtures", locale });
    return {};
  }
  const state = await recordRun("results", syncResults);
  revalidatePath(`/${locale}/admin/sync`);
  return state;
}
