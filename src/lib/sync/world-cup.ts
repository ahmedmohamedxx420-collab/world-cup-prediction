import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { MatchStage } from "@/lib/match-types";
import { fetchWorldCup, type OfMatch } from "./openfootball";

// The 48 finalists, keyed by the EXACT English name the openfootball feed uses
// (that string is how we resolve a fixture's team1/team2). Each maps to its FIFA
// 3-letter code (the stable `teams.code` upsert key, robust to name edits in the
// Teams admin) plus the Arabic name + flag for this Arabic-first app.
const TEAMS: Record<string, { code: string; name_ar: string; flag: string }> = {
  Mexico: { code: "MEX", name_ar: "المكسيك", flag: "🇲🇽" },
  "South Africa": { code: "RSA", name_ar: "جنوب أفريقيا", flag: "🇿🇦" },
  "South Korea": { code: "KOR", name_ar: "كوريا الجنوبية", flag: "🇰🇷" },
  "Czech Republic": { code: "CZE", name_ar: "التشيك", flag: "🇨🇿" },
  Canada: { code: "CAN", name_ar: "كندا", flag: "🇨🇦" },
  "Bosnia & Herzegovina": { code: "BIH", name_ar: "البوسنة والهرسك", flag: "🇧🇦" },
  Qatar: { code: "QAT", name_ar: "قطر", flag: "🇶🇦" },
  Switzerland: { code: "SUI", name_ar: "سويسرا", flag: "🇨🇭" },
  Brazil: { code: "BRA", name_ar: "البرازيل", flag: "🇧🇷" },
  Morocco: { code: "MAR", name_ar: "المغرب", flag: "🇲🇦" },
  Haiti: { code: "HAI", name_ar: "هايتي", flag: "🇭🇹" },
  Scotland: { code: "SCO", name_ar: "اسكتلندا", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  USA: { code: "USA", name_ar: "الولايات المتحدة", flag: "🇺🇸" },
  Paraguay: { code: "PAR", name_ar: "باراغواي", flag: "🇵🇾" },
  Australia: { code: "AUS", name_ar: "أستراليا", flag: "🇦🇺" },
  Turkey: { code: "TUR", name_ar: "تركيا", flag: "🇹🇷" },
  Germany: { code: "GER", name_ar: "ألمانيا", flag: "🇩🇪" },
  Curaçao: { code: "CUW", name_ar: "كوراساو", flag: "🇨🇼" },
  "Ivory Coast": { code: "CIV", name_ar: "ساحل العاج", flag: "🇨🇮" },
  Ecuador: { code: "ECU", name_ar: "الإكوادور", flag: "🇪🇨" },
  Netherlands: { code: "NED", name_ar: "هولندا", flag: "🇳🇱" },
  Japan: { code: "JPN", name_ar: "اليابان", flag: "🇯🇵" },
  Sweden: { code: "SWE", name_ar: "السويد", flag: "🇸🇪" },
  Tunisia: { code: "TUN", name_ar: "تونس", flag: "🇹🇳" },
  Belgium: { code: "BEL", name_ar: "بلجيكا", flag: "🇧🇪" },
  Egypt: { code: "EGY", name_ar: "مصر", flag: "🇪🇬" },
  Iran: { code: "IRN", name_ar: "إيران", flag: "🇮🇷" },
  "New Zealand": { code: "NZL", name_ar: "نيوزيلندا", flag: "🇳🇿" },
  Spain: { code: "ESP", name_ar: "إسبانيا", flag: "🇪🇸" },
  "Cape Verde": { code: "CPV", name_ar: "الرأس الأخضر", flag: "🇨🇻" },
  "Saudi Arabia": { code: "KSA", name_ar: "السعودية", flag: "🇸🇦" },
  Uruguay: { code: "URU", name_ar: "أوروغواي", flag: "🇺🇾" },
  France: { code: "FRA", name_ar: "فرنسا", flag: "🇫🇷" },
  Senegal: { code: "SEN", name_ar: "السنغال", flag: "🇸🇳" },
  Iraq: { code: "IRQ", name_ar: "العراق", flag: "🇮🇶" },
  Norway: { code: "NOR", name_ar: "النرويج", flag: "🇳🇴" },
  Argentina: { code: "ARG", name_ar: "الأرجنتين", flag: "🇦🇷" },
  Algeria: { code: "ALG", name_ar: "الجزائر", flag: "🇩🇿" },
  Austria: { code: "AUT", name_ar: "النمسا", flag: "🇦🇹" },
  Jordan: { code: "JOR", name_ar: "الأردن", flag: "🇯🇴" },
  Portugal: { code: "POR", name_ar: "البرتغال", flag: "🇵🇹" },
  "DR Congo": { code: "COD", name_ar: "الكونغو الديمقراطية", flag: "🇨🇩" },
  Uzbekistan: { code: "UZB", name_ar: "أوزبكستان", flag: "🇺🇿" },
  Colombia: { code: "COL", name_ar: "كولومبيا", flag: "🇨🇴" },
  Ghana: { code: "GHA", name_ar: "غانا", flag: "🇬🇭" },
  Panama: { code: "PAN", name_ar: "بنما", flag: "🇵🇦" },
  England: { code: "ENG", name_ar: "إنجلترا", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  Croatia: { code: "CRO", name_ar: "كرواتيا", flag: "🇭🇷" },
};

type TeamRef = { id: number; group_letter: string | null };

function stageOf(m: OfMatch): MatchStage {
  if (m.group) return "group"; // group matches always carry "Group X"
  const r = m.round;
  if (r.includes("Round of 32")) return "round_32";
  if (r.includes("Round of 16")) return "round_16";
  if (r.includes("Quarter")) return "quarter";
  if (r.includes("Semi")) return "semi";
  if (/third/i.test(r)) return "third_place";
  if (r.includes("Final")) return "final";
  return "group";
}

// "Group A" → "A"; null for knockout matches.
function groupLetter(m: OfMatch): string | null {
  return m.group ? m.group.replace(/^Group\s+/i, "").trim() : null;
}

// "2026-06-11" + "13:00 UTC-6" → "2026-06-11T19:00:00.000Z". The feed gives the
// local kickoff with its UTC offset; we store UTC (predictions close at this
// instant) and the UI renders it in the viewer's zone.
function toUtcIso(date: string, time: string): string {
  const [hhmm, tz = ""] = time.trim().split(/\s+/);
  const m = /^UTC([+-]?\d{1,2})(?::?(\d{2}))?$/.exec(tz);
  const offH = m ? Number(m[1]) : 0;
  const offM = m?.[2] ? Number(m[2]) : 0;
  const pad = (n: number) => String(Math.abs(n)).padStart(2, "0");
  const iso = `${date}T${hhmm}:00${offH < 0 ? "-" : "+"}${pad(offH)}:${pad(offM)}`;
  return new Date(iso).toISOString();
}

// Stable external key for idempotent upserts. Knockout matches carry the official
// FIFA `num` (73–104). Group matches have none, so we hash their fixed identity
// (group + the unordered team pair) into a large positive int that can't collide
// with a knockout num. Both teams are already drawn, so the hash is stable.
function externalId(m: OfMatch): number {
  if (m.num != null) return m.num;
  const id = `G|${m.group}|${[m.team1, m.team2].sort().join("|")}`;
  let h = 0x811c9dc5; // FNV-1a, 32-bit
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return 1_000_000 + (h >>> 0);
}

// Human-readable Arabic label for an unresolved knockout slot (shown until the
// real team is known): "2A" → runner-up of Group A, "W74" → winner of match 74.
function placeholderLabel(token: string): string {
  let m = /^([12])([A-L])$/.exec(token);
  if (m) return `${m[1] === "1" ? "متصدر المجموعة" : "وصيف المجموعة"} ${m[2]}`;
  m = /^3(.+)$/.exec(token);
  if (m) return `أفضل ثالث (${m[1]})`;
  m = /^W(\d+)$/.exec(token);
  if (m) return `الفائز من المباراة ${m[1]}`;
  m = /^L(\d+)$/.exec(token);
  if (m) return `الخاسر من المباراة ${m[1]}`;
  return token;
}

async function teamRefByCode(
  admin: ReturnType<typeof createAdminClient>,
): Promise<Map<string, TeamRef>> {
  const { data, error } = await admin
    .from("teams")
    .select("id, code, group_letter");
  if (error) throw error;

  const map = new Map<string, TeamRef>();
  for (const t of data ?? []) {
    if (t.code) map.set(t.code, { id: t.id, group_letter: t.group_letter });
  }
  return map;
}

// Map one feed match onto a matches-table row. A side resolves to a team only if
// its name is a known finalist; otherwise it stays TBD with an Arabic label.
// Scores are written ONLY when full-time exists, so the 0006 trigger scores
// predictions on finals (not while a match is still scheduled/in progress).
function matchRow(m: OfMatch, teams: Map<string, TeamRef>) {
  const homeCode = TEAMS[m.team1]?.code;
  const awayCode = TEAMS[m.team2]?.code;
  const home = homeCode ? teams.get(homeCode) : undefined;
  const away = awayCode ? teams.get(awayCode) : undefined;

  const ft = m.score?.ft;
  const finished = Array.isArray(ft);

  const pen = m.score?.p;
  let shootoutWinner: number | null = null;
  if (pen && home && away) {
    shootoutWinner = pen[0] > pen[1] ? home.id : away.id;
  }

  return {
    api_fixture_id: externalId(m),
    match_number: m.num ?? null,
    stage: stageOf(m),
    group_letter: groupLetter(m),
    home_team_id: home?.id ?? null,
    away_team_id: away?.id ?? null,
    home_label: home ? null : placeholderLabel(m.team1),
    away_label: away ? null : placeholderLabel(m.team2),
    kickoff_at: toUtcIso(m.date, m.time),
    venue: m.ground ?? null,
    status: finished ? ("finished" as const) : ("scheduled" as const),
    home_score: finished ? ft![0] : null,
    away_score: finished ? ft![1] : null,
    shootout_winner_team_id: shootoutWinner,
  };
}

// Full sync: seed/refresh the 48 teams (with group letters) + every match. Run
// via the admin "Full sync" button — needed once before results syncs can
// resolve teams, and to pick up knockout teams as the bracket fills in.
export async function syncSchedule(): Promise<{ teams: number; fixtures: number }> {
  const admin = createAdminClient();
  const matches = await fetchWorldCup();

  // Derive each team's group letter from the group-stage matches.
  const groupByCode = new Map<string, string>();
  for (const m of matches) {
    const letter = groupLetter(m);
    if (!letter) continue;
    for (const name of [m.team1, m.team2]) {
      const code = TEAMS[name]?.code;
      if (code) groupByCode.set(code, letter);
    }
  }

  const teamRows = Object.entries(TEAMS).map(([name_en, meta]) => ({
    name_en,
    name_ar: meta.name_ar,
    code: meta.code,
    flag: meta.flag,
    group_letter: groupByCode.get(meta.code) ?? null,
  }));

  const { error: teamErr } = await admin
    .from("teams")
    .upsert(teamRows, { onConflict: "code" });
  if (teamErr) throw teamErr;

  const teams = await teamRefByCode(admin);
  const rows = matches.map((m) => matchRow(m, teams));

  const { error: matchErr } = await admin
    .from("matches")
    .upsert(rows, { onConflict: "api_fixture_id" });
  if (matchErr) throw matchErr;

  return { teams: teamRows.length, fixtures: rows.length };
}

// Results sync: one feed fetch; upserts scores/status (and any knockout teams the
// feed has resolved). Final scores flow through the 0006 trigger and auto-score
// predictions. Assumes teams are already seeded (run a full sync first).
export async function syncResults(): Promise<{ fixtures: number }> {
  const admin = createAdminClient();
  const teams = await teamRefByCode(admin);
  const matches = await fetchWorldCup();
  const rows = matches.map((m) => matchRow(m, teams));

  const { error } = await admin
    .from("matches")
    .upsert(rows, { onConflict: "api_fixture_id" });
  if (error) throw error;

  return { fixtures: rows.length };
}
