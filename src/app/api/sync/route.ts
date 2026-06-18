import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncResults } from "@/lib/sync/world-cup";

// Protected sync endpoint for an external scheduler (cron-job.org / GitHub
// Actions) to POST with `Authorization: Bearer <CRON_SECRET>`. Lives under /api,
// which the proxy matcher excludes, so no locale/auth middleware runs here.
// Defends the owner's ≤30 pulls/day budget with a per-UTC-day cap.

const DAILY_CAP = 30;

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let admin: ReturnType<typeof createAdminClient> | null = null;

  try {
    admin = createAdminClient();

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const { count, error: countError } = await admin
      .from("sync_runs")
      .select("id", { count: "exact", head: true })
      .gte("ran_at", startOfDay.toISOString());
    if (countError) throw countError;
    if ((count ?? 0) >= DAILY_CAP) {
      return NextResponse.json(
        { error: "daily cap reached", cap: DAILY_CAP },
        { status: 429 },
      );
    }

    const result = await syncResults();
    await admin
      .from("sync_runs")
      .insert({ kind: "results", ok: true, fixtures_upserted: result.fixtures });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Scheduled results sync failed", error);
    if (admin) {
      const { error: logError } = await admin
        .from("sync_runs")
        .insert({ kind: "results", ok: false, error: message });
      if (logError) {
        console.error("Failed to record scheduled sync failure", logError);
      }
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
