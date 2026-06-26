import type { Team } from "@/lib/teams";

type ScoreValue = number | null | undefined;

const LTR_ISOLATE = "\u2066";
const POP_DIRECTIONAL_ISOLATE = "\u2069";

export function localizedTeamName(team: Team, locale: string) {
  if (locale === "ar") return team.name_ar || team.name_en;
  return team.name_en;
}

export function formatScoreline(
  home: number,
  away: number,
  options?: { isolate?: boolean },
): string;
export function formatScoreline(
  home: ScoreValue,
  away: ScoreValue,
  options?: { isolate?: boolean },
): string | null;
export function formatScoreline(
  home: ScoreValue,
  away: ScoreValue,
  options: { isolate?: boolean } = {},
) {
  if (home == null || away == null) return null;

  const scoreline = `${home}-${away}`;
  return options.isolate
    ? `${LTR_ISOLATE}${scoreline}${POP_DIRECTIONAL_ISOLATE}`
    : scoreline;
}

export function isolateScoreline(scoreline: string): string;
export function isolateScoreline(scoreline: null): null;
export function isolateScoreline(scoreline: undefined): undefined;
export function isolateScoreline(scoreline: string | null): string | null;
export function isolateScoreline(
  scoreline: string | undefined,
): string | undefined;
export function isolateScoreline(scoreline: string | null | undefined) {
  if (!scoreline) return scoreline;
  return `${LTR_ISOLATE}${scoreline}${POP_DIRECTIONAL_ISOLATE}`;
}

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
  locale = "en",
) {
  if (teamId != null) {
    const team = teamMap.get(teamId);
    if (team) {
      return `${team.flag ? `${team.flag} ` : ""}${localizedTeamName(
        team,
        locale,
      )}`;
    }
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
  locale = "en",
) {
  if (teamId != null) {
    const team = teamMap.get(teamId);
    if (team) return localizedTeamName(team, locale);
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
