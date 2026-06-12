import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Temporary connectivity smoke test (Plan item 0.4 Step 4).
// Hit GET /api/supabase-health after setting env vars to confirm the server
// client reaches Supabase. Remove this route once verified.
//
// Before the Phase 2 schema exists there are no app tables, so we probe a
// sentinel table: a `42P01` (undefined_table) error still proves we connected
// and authenticated against PostgREST — it just means "no table yet".
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { ok: false, reason: "Missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY env vars" },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("__healthcheck__")
    .select("*")
    .limit(1);

  if (!error || error.code === "42P01") {
    return NextResponse.json({ ok: true, connected: true });
  }

  return NextResponse.json(
    { ok: false, connected: false, code: error.code, message: error.message },
    { status: 502 },
  );
}
