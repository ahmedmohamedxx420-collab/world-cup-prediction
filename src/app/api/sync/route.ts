import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncResults } from "@/lib/sync/world-cup";

// Protected sync endpoint for an external scheduler (cron-job.org / GitHub
// Actions) to POST with `Authorization: Bearer <CRON_SECRET>`. Lives under /api,
// which the proxy matcher excludes, so no locale/auth middleware runs here.
// Defends the owner's ≤30 pulls/day budget with a per-UTC-day cap.

const DAILY_CAP = 30;

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count, error: countError } = await admin
    .from("sync_runs")
    .select("id", { count: "exact", head: true })
    .gte("ran_at", startOfDay.toISOString());
  if (countError) {
    return NextResponse.json({ error: "count failed" }, { status: 500 });
  }
  if ((count ?? 0) >= DAILY_CAP) {
    return NextResponse.json(
      { error: "daily cap reached", cap: DAILY_CAP },
      { status: 429 },
    );
  }

  try {
    const result = await syncResults();
    await admin
      .from("sync_runs")
      .insert({ kind: "results", ok: true, fixtures_upserted: result.fixtures });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await admin
      .from("sync_runs")
      .insert({ kind: "results", ok: false, error: message });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
