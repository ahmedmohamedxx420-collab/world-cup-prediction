import { type CSSProperties, type ReactNode } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Coins,
  Crown,
  Flame,
  Gem,
  Goal,
  ImagePlus,
  ListChecks,
  Loader2,
  Lock,
  Minus,
  Phone,
  Plus,
  Save,
  Shield,
  Target,
  Trash2,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  DsAvatar,
  DsBadge,
  DsButton,
  DsCard,
  IconContainer,
} from "../components";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// All content below is invented sample data for the design tab only. It is not
// an official World Cup schedule, venue list, or result set.

const FLAGS: Record<string, string> = {
  Brazil: "🇧🇷",
  Croatia: "🇭🇷",
  Japan: "🇯🇵",
  Morocco: "🇲🇦",
  Argentina: "🇦🇷",
  Nigeria: "🇳🇬",
  Spain: "🇪🇸",
  France: "🇫🇷",
  Portugal: "🇵🇹",
  Netherlands: "🇳🇱",
  Senegal: "🇸🇳",
  Mexico: "🇲🇽",
};

function TeamLabel({ name, align }: { name: string; align?: "end" }) {
  const flag = FLAGS[name];
  return (
    <span
      className={cx("ds-fixture-team", align === "end" && "ds-fixture-team--end")}
    >
      {flag ? (
        <span className="ds-team-flag" aria-hidden>
          {flag}
        </span>
      ) : (
        <span className="ds-team-flag ds-team-flag--tbd" aria-hidden>
          ?
        </span>
      )}
      <span className="ds-team-name">{name}</span>
    </span>
  );
}

type FixtureState = "upcoming" | "live" | "finished" | "tbd";

type SampleFixture = {
  state: FixtureState;
  number: string;
  stage: string;
  group?: string;
  home: string;
  away: string;
  kickoff: string;
  venue: string;
  score?: string;
  prediction?: string;
};

const fixtures: SampleFixture[] = [
  {
    state: "upcoming",
    number: "Match 12",
    stage: "Group stage",
    group: "Group H",
    home: "Brazil",
    away: "Croatia",
    kickoff: "Sat - 18:00",
    venue: "Aurora Stadium",
  },
  {
    state: "live",
    number: "Match 11",
    stage: "Group stage",
    group: "Group F",
    home: "Japan",
    away: "Morocco",
    kickoff: "Live - 62'",
    venue: "Harbor Arena",
    score: "1-0",
  },
  {
    state: "finished",
    number: "Match 9",
    stage: "Group stage",
    group: "Group D",
    home: "Argentina",
    away: "Nigeria",
    kickoff: "Yesterday - 21:00",
    venue: "Summit Park",
    score: "2-1",
  },
  {
    state: "tbd",
    number: "Match 38",
    stage: "Round of 16",
    home: "Winner D1",
    away: "Runner-up E",
    kickoff: "Schedule pending",
    venue: "Venue TBD",
  },
];

function LiveDot() {
  return (
    <span className="ds-live-badge">
      <span className="ds-live-badge__dot" aria-hidden />
      Live
    </span>
  );
}

function FixtureCta({ fixture }: { fixture: SampleFixture }) {
  if (fixture.state === "tbd") {
    return <span className="ds-fixture-tbd">Locked until teams are set</span>;
  }
  if (fixture.state === "live") {
    return (
      <span className="ds-fixture-cta">
        <LiveDot />
        <DsButton variant="secondary">View</DsButton>
      </span>
    );
  }
  if (fixture.state === "finished") {
    return (
      <span className="ds-fixture-cta">
        <strong className="ds-fixture-result">{fixture.score}</strong>
        <DsButton variant="secondary">View</DsButton>
      </span>
    );
  }
  return <DsButton icon={<Check aria-hidden />}>Predict</DsButton>;
}

function FixtureRows() {
  return (
    <DsCard className="ds-fixture-card">
      <div className="ds-card-title">
        <IconContainer icon={CalendarDays} tone="lime" />
        <span>Fixtures - states</span>
      </div>
      <div className="ds-fixture-list">
        {fixtures.map((fixture) => (
          <div className="ds-fixture-row" key={fixture.number}>
            <div className="ds-fixture-main">
              <div className="ds-fixture-meta">
                <span className="ds-fixture-num">{fixture.number}</span>
                <span>{fixture.stage}</span>
                {fixture.group ? <span>{fixture.group}</span> : null}
              </div>
              <div className="ds-fixture-teams">
                <TeamLabel name={fixture.home} />
                <span className="ds-fixture-score">
                  {fixture.score ?? "vs"}
                </span>
                <TeamLabel name={fixture.away} align="end" />
              </div>
              <div className="ds-fixture-foot">
                <span className="ds-fixture-clock">
                  <Clock3 aria-hidden />
                  {fixture.kickoff}
                </span>
                <span>{fixture.venue}</span>
              </div>
            </div>
            <div className="ds-fixture-end">
              <FixtureCta fixture={fixture} />
            </div>
          </div>
        ))}
      </div>
    </DsCard>
  );
}

type StatusKey = "saved" | "locked" | "error";

const statusPills: Record<
  StatusKey,
  { icon: LucideIcon; text: string }
> = {
  saved: { icon: Check, text: "Prediction saved" },
  locked: { icon: Lock, text: "Locked at kickoff" },
  error: { icon: CircleAlert, text: "Could not save" },
};

function Stepper({ team, value }: { team: string; value: number }) {
  return (
    <div className="ds-stepper">
      <span className="ds-stepper__team">{team}</span>
      <div className="ds-stepper__controls">
        <button className="ds-stepper__btn" type="button" aria-label="Decrease">
          <Minus aria-hidden />
        </button>
        <output className="ds-stepper__value">{value}</output>
        <button className="ds-stepper__btn" type="button" aria-label="Increase">
          <Plus aria-hidden />
        </button>
      </div>
    </div>
  );
}

function PredictionStepper() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={Goal} tone="emerald" />
        <span>Score prediction</span>
      </div>
      <div className="ds-stepper-grid">
        <Stepper team="Brazil" value={2} />
        <Stepper team="Croatia" value={1} />
      </div>
      <div className="ds-status-row">
        {(Object.keys(statusPills) as StatusKey[]).map((key) => {
          const { icon: Icon, text } = statusPills[key];
          return (
            <span className={cx("ds-status-pill", `ds-status-pill--${key}`)} key={key}>
              <Icon aria-hidden />
              {text}
            </span>
          );
        })}
        <span className="ds-status-pill ds-status-pill--saving">
          <Loader2 className="ds-spin" aria-hidden />
          Saving...
        </span>
      </div>
    </DsCard>
  );
}

type RevealMember = {
  name: string;
  initials: string;
  tone: "emerald" | "lime" | "blue" | "rose";
  points: string;
  score: string;
  mine?: boolean;
};

const revealMembers: RevealMember[] = [
  { name: "Layla H.", initials: "LH", tone: "lime", points: "+7 pts", score: "2-1", mine: true },
  { name: "Omar K.", initials: "OK", tone: "emerald", points: "+4 pts", score: "2-0" },
  { name: "Sara M.", initials: "SM", tone: "blue", points: "+2 pts", score: "1-1" },
  { name: "Yusuf A.", initials: "YA", tone: "rose", points: "0 pts", score: "0-3" },
];

function RevealList() {
  return (
    <DsCard>
      <div className="ds-reveal-head">
        <span>Revealed predictions</span>
        <span className="ds-reveal-result">Result 2-1</span>
      </div>
      <div className="ds-list">
        {revealMembers.map((member) => (
          <div
            className={cx("ds-reveal-row", member.mine && "is-mine")}
            key={member.name}
          >
            <DsAvatar initials={member.initials} tone={member.tone} />
            <div>
              <strong>
                {member.name}
                {member.mine ? <span className="ds-you-tag">(You)</span> : null}
              </strong>
              <span>{member.points}</span>
            </div>
            <b className="ds-reveal-score">{member.score}</b>
          </div>
        ))}
      </div>
    </DsCard>
  );
}

type BoardEntry = {
  rank: string;
  name: string;
  initials: string;
  tone: "emerald" | "lime" | "blue";
  points: string;
  stats: Array<[string, string]>;
  mine?: boolean;
};

const board: BoardEntry[] = [
  {
    rank: "1",
    name: "Layla H.",
    initials: "LH",
    tone: "lime",
    points: "64",
    mine: true,
    stats: [["Exact", "7"], ["GD", "4"], ["Winner", "9"], ["Miss", "3"]],
  },
  {
    rank: "2",
    name: "Omar K.",
    initials: "OK",
    tone: "emerald",
    points: "58",
    stats: [["Exact", "5"], ["GD", "6"], ["Winner", "8"], ["Miss", "4"]],
  },
  {
    rank: "3",
    name: "Sara M.",
    initials: "SM",
    tone: "blue",
    points: "51",
    stats: [["Exact", "4"], ["GD", "5"], ["Winner", "7"], ["Miss", "6"]],
  },
];

function StatChip({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <span className={cx("ds-statchip", emphasis && "is-emphasis")}>
      <b>{value}</b>
      <span>{label}</span>
    </span>
  );
}

function FormDots({ dots }: { dots: Array<"exact" | "partial" | "miss"> }) {
  return (
    <span className="ds-formdots" aria-label="Recent form">
      {dots.map((dot, index) => (
        <span className={cx("ds-formdot", `ds-formdot--${dot}`)} key={`${dot}-${index}`} />
      ))}
    </span>
  );
}

function Leaderboard() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={Trophy} tone="lime" />
        <span>Leaderboard rows</span>
      </div>
      <div className="ds-list">
        {board.map((entry) => (
          <div className={cx("ds-board-row", entry.mine && "is-mine")} key={entry.rank}>
            <span className={cx("ds-board-rank", entry.rank === "1" && "is-gold")}>
              {entry.rank}
            </span>
            <DsAvatar initials={entry.initials} tone={entry.tone} />
            <div className="ds-board-body">
              <strong>
                {entry.name}
                {entry.mine ? <span className="ds-you-tag">(You)</span> : null}
              </strong>
              <span className="ds-statchip-row">
                {entry.stats.map(([label, value]) => (
                  <StatChip key={label} label={label} value={value} />
                ))}
              </span>
            </div>
            <span className="ds-board-points">
              <strong>{entry.points}</strong>
              <span>pts</span>
            </span>
          </div>
        ))}
      </div>
    </DsCard>
  );
}

function MyResultsHeader() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={ListChecks} tone="emerald" />
        <span>My results - stats and form</span>
      </div>
      <div className="ds-statchip-row">
        <StatChip label="Points" value="64" emphasis />
        <StatChip label="Made" value="23" />
        <StatChip label="Exact" value="7" />
        <StatChip label="GD" value="4" />
        <StatChip label="Winner" value="9" />
        <StatChip label="Miss" value="3" />
      </div>
      <div className="ds-statchip-row">
        <span className="ds-statchip">
          <FormDots dots={["exact", "partial", "miss", "exact", "exact"]} />
          <span>Form</span>
        </span>
        <StatChip label="Streak" value="4" />
        <StatChip label="Best streak" value="6" />
        <StatChip label="Fav score" value="2-1" />
        <StatChip label="Best match" value="Match 9 - +7" emphasis />
      </div>
      <div className="ds-result-tiles">
        <div className="ds-result-tile">
          <span>Prediction</span>
          <strong>2-1</strong>
        </div>
        <div className="ds-result-tile">
          <span>Actual</span>
          <strong>2-1</strong>
        </div>
        <div className="ds-result-tile ds-result-tile--win">
          <span>Points</span>
          <strong>+7</strong>
        </div>
      </div>
    </DsCard>
  );
}

type Award = {
  icon: LucideIcon;
  title: string;
  desc: string;
  value: string;
  holder?: { name: string; initials: string; tone: "emerald" | "lime" | "blue" };
};

const awards: Award[] = [
  {
    icon: Target,
    title: "Sniper",
    desc: "Most exact scorelines",
    value: "7 exact",
    holder: { name: "Layla H.", initials: "LH", tone: "lime" },
  },
  {
    icon: Flame,
    title: "Hot Streak",
    desc: "Longest run of hits",
    value: "5 matches",
    holder: { name: "Omar K.", initials: "OK", tone: "emerald" },
  },
  {
    icon: Shield,
    title: "The Wall",
    desc: "Lowest goals conceded",
    value: "0.8 avg",
    holder: { name: "Sara M.", initials: "SM", tone: "blue" },
  },
  {
    icon: Clock3,
    title: "Last-Minute Larry",
    desc: "Closest to kickoff",
    value: "Not awarded",
  },
];

function HallOfFame() {
  return (
    <div className="ds-section__subhead">
      <h3 className="ds-subhead">Hall of Fame</h3>
      <div className="ds-award-grid">
        {awards.map((award) => {
          const Icon = award.icon;
          const awarded = Boolean(award.holder);
          return (
            <DsCard
              className={cx("ds-award-card", !awarded && "is-empty")}
              key={award.title}
            >
              <div className="ds-award-top">
                <span className="ds-award-icon">
                  <Icon aria-hidden />
                </span>
                <DsBadge tone={awarded ? "gold" : "neutral"}>{award.value}</DsBadge>
              </div>
              <div className="ds-award-copy">
                <strong>{award.title}</strong>
                <span>{award.desc}</span>
              </div>
              <div className="ds-award-holder">
                {award.holder ? (
                  <>
                    <DsAvatar
                      initials={award.holder.initials}
                      tone={award.holder.tone}
                    />
                    <span>{award.holder.name}</span>
                  </>
                ) : (
                  <span className="ds-award-empty">Not yet awarded</span>
                )}
              </div>
            </DsCard>
          );
        })}
      </div>
    </div>
  );
}

function SelectMock({ label, value }: { label: string; value: string }) {
  return (
    <label className="ds-field">
      <span className="ds-label">{label}</span>
      <span className="ds-select-shell">
        <span>{value}</span>
        <ChevronDown aria-hidden />
      </span>
    </label>
  );
}

function ScoreFieldMock({ label, value }: { label: string; value: string }) {
  return (
    <label className="ds-field ds-field--score">
      <span className="ds-label">{label}</span>
      <span className="ds-input-shell ds-input-shell--score">
        <span>{value}</span>
      </span>
    </label>
  );
}

function AvatarUploadMock() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={ImagePlus} tone="emerald" />
        <span>Avatar upload</span>
      </div>
      <div className="ds-avatar-upload">
        <DsAvatar initials="LH" tone="emerald" />
        <div className="ds-avatar-upload__body">
          <div className="ds-action-row">
            <DsButton variant="secondary" icon={<ImagePlus aria-hidden />}>
              Change
            </DsButton>
            <DsButton variant="ghost" icon={<Trash2 aria-hidden />}>
              Remove
            </DsButton>
          </div>
          <span className="ds-avatar-upload__hint">
            Square image, up to 1 MB. Saved on submit.
          </span>
        </div>
      </div>
    </DsCard>
  );
}

function PhoneInputMock() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={Phone} tone="emerald" />
        <span>Phone sign-in</span>
      </div>
      <label className="ds-field">
        <span className="ds-label">Mobile number</span>
        <span className="ds-phone-input">
          <span className="ds-phone-input__code">
            +1
            <ChevronDown aria-hidden />
          </span>
          <span className="ds-phone-input__num">555 0142 88</span>
        </span>
      </label>
      <div className="ds-otp">
        {["4", "9", "1", "", "", ""].map((char, index) => (
          <span className={cx("ds-otp__cell", char && "is-filled")} key={index}>
            {char}
          </span>
        ))}
      </div>
      <DsButton>Verify code</DsButton>
    </DsCard>
  );
}

function AdminResultForm() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={Save} tone="lime" />
        <span>Admin - record result</span>
      </div>
      <div className="ds-fixture-teams ds-admin-teams">
        <span className="ds-fixture-team">Argentina</span>
        <span className="ds-fixture-score">FT</span>
        <span className="ds-fixture-team ds-fixture-team--end">Nigeria</span>
      </div>
      <div className="ds-admin-row">
        <ScoreFieldMock label="Home" value="2" />
        <ScoreFieldMock label="Away" value="1" />
        <SelectMock label="Shootout winner" value="No shootout" />
      </div>
      <div className="ds-action-row">
        <DsButton>Save</DsButton>
        <DsButton variant="ghost">Clear result</DsButton>
      </div>
    </DsCard>
  );
}

function AdminFixtureForm() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={CalendarDays} tone="emerald" />
        <span>Admin - edit fixture</span>
      </div>
      <div className="ds-admin-grid">
        <SelectMock label="Stage" value="Group stage" />
        <SelectMock label="Group" value="Group H" />
        <SelectMock label="Home team" value="Brazil" />
        <SelectMock label="Away team" value="Croatia" />
        <ScoreFieldMock label="Match number" value="12" />
        <label className="ds-field">
          <span className="ds-label">Venue</span>
          <span className="ds-input-shell">
            <span>Aurora Stadium</span>
          </span>
        </label>
      </div>
      <DsButton>Save fixture</DsButton>
    </DsCard>
  );
}

type SyncRow = {
  ok: boolean;
  kind: string;
  time: string;
  detail: string;
};

const syncRuns: SyncRow[] = [
  { ok: true, kind: "Schedule", time: "Today - 06:00 UTC", detail: "48 fixtures upserted" },
  { ok: true, kind: "Results", time: "Today - 06:05 UTC", detail: "12 fixtures upserted" },
  { ok: false, kind: "Results", time: "Yesterday - 22:00 UTC", detail: "Upstream timeout" },
];

function SyncLog() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={ListChecks} tone="emerald" />
        <span>Sync log</span>
      </div>
      <div className="ds-sync-list">
        {syncRuns.map((run) => (
          <div className="ds-sync-row" key={`${run.kind}-${run.time}`}>
            <span className="ds-sync-left">
              <span className={cx("ds-sync-status", run.ok ? "is-ok" : "is-fail")}>
                {run.ok ? "OK" : "Failed"}
              </span>
              <span className="ds-sync-kind">{run.kind}</span>
            </span>
            <span className="ds-sync-right">
              <span>{run.time}</span>
              <span className="ds-sync-detail">{run.detail}</span>
            </span>
          </div>
        ))}
      </div>
    </DsCard>
  );
}

function MatchdayFeature() {
  return (
    <div className="ds-matchday">
      <span className="ds-matchday__pitch" aria-hidden />
      <div className="ds-matchday__top">
        <div className="ds-matchday__tags">
          <span className="ds-pill ds-pill--glass">Group stage</span>
          <span className="ds-pill ds-pill--glass">Group H</span>
          <span className="ds-pill ds-pill--glass">Match 12</span>
        </div>
        <span className="ds-pill ds-pill--glass">
          <Trophy aria-hidden />
          Matchday 3
        </span>
      </div>

      <div className="ds-matchday__teams">
        <div className="ds-matchday__side">
          <span className="ds-matchday__flag" aria-hidden>
            🇧🇷
          </span>
          <span className="ds-matchday__name">Brazil</span>
        </div>
        <span className="ds-matchday__vs">VS</span>
        <div className="ds-matchday__side">
          <span className="ds-matchday__flag" aria-hidden>
            🇭🇷
          </span>
          <span className="ds-matchday__name">Croatia</span>
        </div>
      </div>

      <div className="ds-countdown" aria-label="Kickoff in 2 hours 14 minutes">
        <span className="ds-countdown__seg">
          <strong>02</strong>
          <span>Hrs</span>
        </span>
        <span className="ds-countdown__colon">:</span>
        <span className="ds-countdown__seg">
          <strong>14</strong>
          <span>Min</span>
        </span>
        <span className="ds-countdown__colon">:</span>
        <span className="ds-countdown__seg">
          <strong>39</strong>
          <span>Sec</span>
        </span>
      </div>

      <div className="ds-matchday__foot">
        <span className="ds-matchday__venue">
          <Clock3 aria-hidden />
          Aurora Stadium - Sat 18:00
        </span>
        <DsButton icon={<Goal aria-hidden />}>Predict score</DsButton>
      </div>
    </div>
  );
}

type StandRow = {
  pos: number;
  name: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
  q?: boolean;
};

const groupH: StandRow[] = [
  { pos: 1, name: "Brazil", p: 3, w: 2, d: 1, l: 0, gf: 6, ga: 2, pts: 7, q: true },
  { pos: 2, name: "Croatia", p: 3, w: 2, d: 0, l: 1, gf: 4, ga: 3, pts: 6, q: true },
  { pos: 3, name: "Senegal", p: 3, w: 1, d: 0, l: 2, gf: 3, ga: 4, pts: 3 },
  { pos: 4, name: "Mexico", p: 3, w: 0, d: 1, l: 2, gf: 1, ga: 5, pts: 1 },
];

function GroupStandings() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={Shield} tone="lime" />
        <span>Group H - standings</span>
      </div>
      <div className="ds-standings-card">
        <table className="ds-standings">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {groupH.map((row) => (
              <tr key={row.name} className={cx(row.q && "is-q")}>
                <td>
                  <span className="ds-stand-pos">{row.pos}</span>
                </td>
                <td>
                  <span className="ds-stand-team">
                    <span className="ds-bracket-flag" aria-hidden>
                      {FLAGS[row.name]}
                    </span>
                    {row.name}
                  </span>
                </td>
                <td>{row.p}</td>
                <td>{row.w}</td>
                <td>{row.d}</td>
                <td>{row.l}</td>
                <td>{row.gf}</td>
                <td>{row.ga}</td>
                <td>
                  <span className="ds-stand-pts">{row.pts}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="ds-stand-legend">
        <span className="ds-stand-key" aria-hidden />
        Top 2 advance to the knockout stage
      </span>
    </DsCard>
  );
}

type BracketMatch = { home: string; away: string; hs: number; as: number };

function BracketCard({ match }: { match: BracketMatch }) {
  const homeWin = match.hs > match.as;
  return (
    <div className="ds-bracket-match">
      <span className={cx("ds-bracket-team", homeWin && "is-win")}>
        <span className="ds-bracket-flag" aria-hidden>
          {FLAGS[match.home]}
        </span>
        <span className="ds-bracket-name">{match.home}</span>
        <span className="ds-bracket-score">{match.hs}</span>
      </span>
      <span className={cx("ds-bracket-team", !homeWin && "is-win")}>
        <span className="ds-bracket-flag" aria-hidden>
          {FLAGS[match.away]}
        </span>
        <span className="ds-bracket-name">{match.away}</span>
        <span className="ds-bracket-score">{match.as}</span>
      </span>
    </div>
  );
}

const bracketQf: BracketMatch[] = [
  { home: "Brazil", away: "Spain", hs: 2, as: 1 },
  { home: "France", away: "Japan", hs: 1, as: 2 },
  { home: "Argentina", away: "Morocco", hs: 3, as: 1 },
  { home: "Portugal", away: "Netherlands", hs: 0, as: 1 },
];

const bracketSf: BracketMatch[] = [
  { home: "Brazil", away: "Japan", hs: 2, as: 0 },
  { home: "Argentina", away: "Netherlands", hs: 1, as: 2 },
];

const bracketFinal: BracketMatch = {
  home: "Brazil",
  away: "Netherlands",
  hs: 3,
  as: 2,
};

function KnockoutBracket() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={Trophy} tone="lime" />
        <span>Knockout bracket</span>
      </div>
      <div className="ds-bracket-card">
        <div className="ds-bracket">
          <div className="ds-bracket__round">
            <span className="ds-bracket__label">Quarter-finals</span>
            {bracketQf.map((match) => (
              <BracketCard key={`${match.home}-${match.away}`} match={match} />
            ))}
          </div>
          <div className="ds-bracket__round">
            <span className="ds-bracket__label">Semi-finals</span>
            {bracketSf.map((match) => (
              <BracketCard key={`${match.home}-${match.away}`} match={match} />
            ))}
          </div>
          <div className="ds-bracket__round">
            <span className="ds-bracket__label">Final</span>
            <BracketCard match={bracketFinal} />
            <div className="ds-champion">
              <Trophy aria-hidden />
              <span className="ds-champion__flag" aria-hidden>
                🇧🇷
              </span>
              <strong>Brazil</strong>
              <span>Champions</span>
            </div>
          </div>
        </div>
      </div>
    </DsCard>
  );
}

// --- Podium color-option previews (comparison only) ----------------------
// Three transparent medal-shadow treatments for the top-3 podium.
// Uses the real .wc-fut-card system with .wc-podium-a/b/c--N overrides.
type PodiumSample = {
  rank: 1 | 2 | 3;
  name: string;
  initials: string;
  points: number;
  exact: number;
  acc: number;
};

const podiumSample: PodiumSample[] = [
  { rank: 1, name: "Layla H.", initials: "LH", points: 64, exact: 7, acc: 78 },
  { rank: 2, name: "Omar K.", initials: "OK", points: 58, exact: 5, acc: 71 },
  { rank: 3, name: "Sara M.", initials: "SM", points: 51, exact: 4, acc: 66 },
];

const PODIUM_MEDAL: Record<2 | 3, string> = { 2: "🥈", 3: "🥉" };

// Static mirror of the leaderboard <CardPrize> for the design-system gallery.
function PreviewPrize({ rank }: { rank: 1 | 2 | 3 }) {
  return (
    <span className="wc-prize" aria-label="Prize">
      <span className="wc-prize__eyebrow" aria-hidden>
        <Trophy className="wc-prize__eyebrow-icon" />
        Prize
      </span>
      {rank === 1 ? (
        <span className="wc-prize__chip wc-prize__chip--cash">
          <Coins className="wc-prize__icon" aria-hidden />
          <span className="wc-prize__label">50 SAR</span>
          {["12%", "34%", "56%", "78%", "92%"].map((x, i) => (
            <span
              key={i}
              className="wc-prize__coin"
              style={
                { "--wc-delay": `${-0.2 - i * 0.9}s`, "--wc-x": x } as CSSProperties
              }
              aria-hidden
            >
              $
            </span>
          ))}
        </span>
      ) : null}
      {rank !== 1 ? (
        <span className="wc-prize__chip wc-prize__chip--nitro">
          <Gem className="wc-prize__icon" aria-hidden />
          <span className="wc-prize__label">Nitro</span>
        </span>
      ) : null}
      {rank !== 3 ? (
        <span className="wc-prize__chip wc-prize__chip--role">
          <span className="wc-prize__role-dot" aria-hidden />
          <span className="wc-prize__label">Custom Role</span>
        </span>
      ) : null}
    </span>
  );
}

function PodiumPreview({ variant }: { variant: string }) {
  // Render order places the champion in the middle (2nd, 1st, 3rd).
  const order: PodiumSample[] = [podiumSample[1], podiumSample[0], podiumSample[2]];
  return (
    <div className="wc-podium-cards px-0.5 pt-3">
      <div className="grid grid-cols-3 items-end gap-2 [direction:ltr]">
        {order.map((p) => {
          const champ = p.rank === 1;
          return (
            <div
              key={p.rank}
              className={cx(
                "wc-fut-card",
                `${variant}--${p.rank}`,
                champ && "wc-fut-card--champion",
              )}
            >
              <span className="flex w-full items-start justify-between">
                <span className="flex flex-col items-center leading-none">
                  <span
                    className={cx(
                      "font-black tabular-nums",
                      champ ? "text-3xl" : "text-2xl",
                    )}
                  >
                    {p.points}
                  </span>
                  <span className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-widest opacity-70">
                    pts
                  </span>
                </span>
                <span className="wc-fut-card__mark text-xl leading-none" aria-hidden>
                  {champ ? (
                    <Crown className="size-6 text-gold-foreground/80" />
                  ) : (
                    PODIUM_MEDAL[p.rank as 2 | 3]
                  )}
                </span>
              </span>

              <span
                className={cx(
                  "wc-fut-card__avatar flex items-center justify-center rounded-full font-black",
                  champ ? "size-20 text-xl" : "size-16 text-base",
                )}
              >
                {p.initials}
              </span>

              <span
                className={cx(
                  "max-w-full truncate text-center font-black uppercase leading-tight tracking-tight",
                  champ ? "text-sm" : "text-xs",
                )}
              >
                {p.name}
              </span>

              <PreviewPrize rank={p.rank} />

              <span className="wc-fut-card__attrs">
                <span className="flex flex-col items-center gap-0.5">
                  <span className="text-sm font-black tabular-nums leading-none">
                    {p.exact}
                  </span>
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider opacity-70">
                    Exact
                  </span>
                </span>
                <span className="flex flex-col items-center gap-0.5">
                  <span className="text-sm font-black tabular-nums leading-none">
                    {p.acc}%
                  </span>
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider opacity-70">
                    Acc
                  </span>
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const podiumOptions: Array<{ id: string; variant: string; label: string; note: string }> = [
  {
    id: "a",
    variant: "wc-podium-a",
    label: "Option A - Clear glass + medal shadow",
    note: "All three cards stay frosted and transparent. Gold, silver, and bronze show up mainly as the colored shadow behind each rank.",
  },
  {
    id: "b",
    variant: "wc-podium-b",
    label: "Option B - Neutral glass + big halo",
    note: "The card fill is nearly neutral, while each rank gets a wider medal glow around it. This is the softest and most airy version.",
  },
  {
    id: "c",
    variant: "wc-podium-c",
    label: "Option C - Pitch glass + medal outline",
    note: "All three cards share the same green-tinted glass surface, then rank is marked by gold, silver, and bronze outline shadows.",
  },
];

function PodiumOptions() {
  return (
    <Subgroup title="Top 1/2/3 card options">
      <div className="ds-stack">
        {podiumOptions.map((option) => (
          <DsCard key={option.id}>
            <div className="ds-card-title">
              <IconContainer icon={Trophy} tone="lime" />
              <span>{option.label}</span>
            </div>
            <div className="ds-podium-stage">
              <PodiumPreview variant={option.variant} />
            </div>
            <p className="mt-4 text-sm leading-relaxed opacity-70">{option.note}</p>
          </DsCard>
        ))}
      </div>
    </Subgroup>
  );
}

function Subgroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="ds-section__subhead">
      <h3 className="ds-subhead">{title}</h3>
      {children}
    </div>
  );
}

export function WorldCupSection() {
  return (
    <section className="ds-section" id="world-cup" aria-labelledby="world-cup-title">
      <div className="ds-section__header">
        <span className="ds-kicker">12</span>
        <h2 id="world-cup-title">World Cup Patterns</h2>
        <p>
          App-specific football patterns - fixtures, predictions, leaderboard,
          awards, and admin tools - rebuilt in the design-tab theme. Sample data
          only; not an official schedule.
        </p>
      </div>

      <MatchdayFeature />

      <PodiumOptions />

      <Subgroup title="Fixtures and predictions">
        <div className="ds-grid ds-grid--two">
          <FixtureRows />
          <div className="ds-stack">
            <PredictionStepper />
            <RevealList />
          </div>
        </div>
      </Subgroup>

      <Subgroup title="Groups and knockout">
        <div className="ds-grid ds-grid--two">
          <GroupStandings />
          <KnockoutBracket />
        </div>
      </Subgroup>

      <Subgroup title="Leaderboard and results">
        <div className="ds-grid ds-grid--two">
          <Leaderboard />
          <MyResultsHeader />
        </div>
      </Subgroup>

      <HallOfFame />

      <Subgroup title="Profile and admin">
        <div className="ds-grid ds-grid--two">
          <div className="ds-stack">
            <AvatarUploadMock />
            <PhoneInputMock />
          </div>
          <div className="ds-stack">
            <AdminResultForm />
            <AdminFixtureForm />
            <SyncLog />
          </div>
        </div>
      </Subgroup>
    </section>
  );
}
