import type { Team } from "@/lib/teams";

// Client-safe display helpers shared by the admin fixtures/results lists (and,
// later, the member fixtures view). No "server-only" import — only a type
// import from teams.ts, which is erased at runtime.

// A match side resolves to its team (flag + English name) if assigned,
// otherwise its placeholder label (e.g. "Winner Group A"), else a TBD dash.
export function sideName(
  teamMap: Map<number, Team>,
  teamId: number | null,
  label: string | null,
  tbd: string,
) {
  if (teamId != null) {
    const team = teamMap.get(teamId);
    if (team) return `${team.flag ? `${team.flag} ` : ""}${team.name_en}`;
  }
  return label || tbd;
}

// Same resolution as sideName, but without the leading flag. Use this in views
// that render the flag as its own visual element.
export function sideLabel(
  teamMap: Map<number, Team>,
  teamId: number | null,
  label: string | null,
  tbd: string,
) {
  if (teamId != null) {
    const team = teamMap.get(teamId);
    if (team) return team.name_en;
  }
  return label || tbd;
}

// Kickoff is stored UTC; the admin enters/sees UTC, so render it explicitly in
// UTC with the active locale's formatting.
export function formatKickoffUtc(iso: string, locale: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date)} UTC`;
}
