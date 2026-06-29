import { Coins, Crown, Gem, Info, Trophy } from "lucide-react";
import type { CSSProperties } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/components/empty-state";
import { BADGE_META, HallOfFame } from "@/components/hall-of-fame";
import { ResultsBreakdown } from "@/components/results-breakdown";
import { ScoringStrip } from "@/components/scoring-legend";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import { getAppSettings } from "@/lib/app-settings";
import {
  computeHallOfFame,
  computePlayerStats,
  type Badge,
  type BadgeKey,
  type PlayerStats,
} from "@/lib/hall-of-fame";
import {
  getLeaderboard,
  getMemberStats,
  getUserResults,
  type LeaderboardRow,
  type MemberProfile,
  type UserResult,
  MemberStatsUnavailableError,
} from "@/lib/leaderboard";
import { getCurrentUser } from "@/lib/profile";
import { listTeams, type Team } from "@/lib/teams";
import { cn } from "@/lib/utils";

type Tab = "board" | "hall-of-fame" | "my-results";

function tabHref(tab: Tab) {
  if (tab === "board") return "/leaderboard";
  return `/leaderboard?tab=${tab}`;
}

function TabLink({
  tab,
  activeTab,
  label,
}: {
  tab: Tab;
  activeTab: Tab;
  label: string;
}) {
  const active = tab === activeTab;

  return (
    <Link
      href={tabHref(tab)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full px-3 py-2 text-center text-sm font-semibold transition-colors",
        active
          ? "bg-lime text-lime-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

const STAT_TONES = {
  lime: "bg-lime/20 text-foreground",
  gold: "bg-gold/20 text-gold-foreground",
  emerald:
    "border border-primary/25 bg-white/90 text-[#0f2a1d] shadow-sm dark:border-white/20 dark:bg-white/90 dark:text-[#0f2a1d]",
  muted: "bg-muted/50 text-muted-foreground",
} as const;

function StatPill({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: number;
  tone?: keyof typeof STAT_TONES;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
        STAT_TONES[tone],
      )}
    >
      <span className="font-semibold tabular-nums">{value}</span>
      <span>{label}</span>
    </span>
  );
}

type LeaderboardT = Awaited<ReturnType<typeof getTranslations>>;
type RankTier = "chase" | "top10" | "top20" | "rest";
type PodiumMedal = "gold" | "silver" | "bronze";

const TIER_ORDER: RankTier[] = ["chase", "top10", "top20", "rest"];

const TIER_LABEL_KEYS: Record<
  RankTier,
  "tierChasers" | "tierTop10" | "tierTop20" | "tierField"
> = {
  chase: "tierChasers",
  top10: "tierTop10",
  top20: "tierTop20",
  rest: "tierField",
};

const BOARD_TIER_STYLES: Record<
  RankTier,
  {
    badge: string;
    card: string;
    density: string;
    points: string;
    avatar: string;
  }
> = {
  chase: {
    badge: "bg-lime-grad text-lime-foreground shadow-lime",
    card:
      "border-lime/45 bg-card/95 shadow-[0_12px_28px_rgba(198,242,78,0.16)]",
    density: "p-4",
    points: "text-2xl",
    avatar: "size-10",
  },
  top10: {
    badge: "bg-primary text-primary-foreground shadow-sm",
    card: "border-primary/25 bg-card/95",
    density: "p-4",
    points: "text-2xl",
    avatar: "size-10",
  },
  top20: {
    badge:
      "bg-sky-500/10 text-sky-800 ring-1 ring-sky-500/25 dark:text-sky-200",
    card: "border-sky-400/25 bg-card/90",
    density: "p-3.5",
    points: "text-xl",
    avatar: "size-9 text-xs",
  },
  rest: {
    badge: "bg-muted text-muted-foreground",
    card: "border-border/70 bg-card/80",
    density: "p-3",
    points: "text-xl",
    avatar: "size-9 text-xs",
  },
};

// Tier is derived from a row's *standing* (its 1-based position in the sorted
// board), not from `rank`. `rank` (SQL rank()) contains ties and gaps, so two
// players can share a rank. Since the podium only has 3 cards, a player tied
// into a top-3 rank can spill into the field list with rank <= 3, land in the
// `top10` tier, and render *below* the lower-scoring rank 4-5 `chase` players.
// Standing is strictly increasing, so tier sections always stay in
// points-descending order.
function standingTier(standing: number): RankTier {
  if (standing <= 5) return "chase";
  if (standing <= 10) return "top10";
  if (standing <= 20) return "top20";
  return "rest";
}

function tierSections(
  rows: LeaderboardRow[],
  startStanding: number,
  t: LeaderboardT,
) {
  const ranked = rows.map((row, index) => ({
    row,
    standing: startStanding + index,
  }));
  return TIER_ORDER.map((tier) => ({
    tier,
    label: t(TIER_LABEL_KEYS[tier]),
    rows: ranked
      .filter((entry) => standingTier(entry.standing) === tier)
      .map((entry) => entry.row),
  })).filter((section) => section.rows.length > 0);
}

const MEDAL_EMOJI: Record<PodiumMedal, string> = {
  gold: "🥇",
  silver: "🥈",
  bronze: "🥉",
};

// Display-only tournament prizes shown on each podium card (top 3). These are a
// one-off Discord-tournament config, so they live here rather than in the DB.
type PrizeKind = "cash" | "nitro" | "role";
const PODIUM_PRIZES: Record<PodiumMedal, PrizeKind[]> = {
  gold: ["cash", "role"],
  silver: ["nitro", "role"],
  bronze: ["nitro"],
};

// Floating "$" particles layered over the cash chip — staggered for a money-rain feel.
const COIN_PARTICLES = [
  { delay: "-0.2s", x: "12%" },
  { delay: "-0.9s", x: "34%" },
  { delay: "-1.5s", x: "56%" },
  { delay: "-2.1s", x: "78%" },
  { delay: "-2.7s", x: "92%" },
];

function accuracyPct(row: LeaderboardRow) {
  if (row.scored_count <= 0) return 0;
  const hits = row.exact_count + row.gd_count + row.winner_count;
  return Math.round((hits / row.scored_count) * 100);
}

// Points per scored match — gives each card a FUT-style "rating" feel.
function pointsPerMatch(row: LeaderboardRow) {
  if (row.scored_count <= 0) return "0.0";
  return (row.total_points / row.scored_count).toFixed(1);
}

function CardAttr({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span className="text-sm font-black tabular-nums leading-none sm:text-base">
        {value}
      </span>
      <span className="text-[0.58rem] font-bold tracking-wider uppercase opacity-70">
        {label}
      </span>
    </span>
  );
}

// Hall-of-Fame honours the player currently holds, shown as icon chips on the card.
function CardAchievements({
  keys,
  t,
}: {
  keys: BadgeKey[];
  t: LeaderboardT;
}) {
  if (keys.length === 0) return null;

  return (
    <span className="wc-fut-card__badges" aria-label={t("hallOfFame.title")}>
      {keys.map((key) => {
        const Icon = BADGE_META[key].icon;
        const label = t(`hallOfFame.${key}Title`);
        return (
          <span
            key={key}
            className={cn("wc-fut-card__badge", BADGE_META[key].iconClassName)}
            title={label}
          >
            <Icon className="size-4" aria-hidden />
            <span className="sr-only">{label}</span>
          </span>
        );
      })}
    </span>
  );
}

// Tournament reward chips shown beneath a podium player's name.
function CardPrize({ medal, t }: { medal: PodiumMedal; t: LeaderboardT }) {
  const prizes = PODIUM_PRIZES[medal];
  if (prizes.length === 0) return null;

  return (
    <span className="wc-prize" aria-label={t("prizes.label")}>
      <span className="wc-prize__eyebrow" aria-hidden>
        <Trophy className="wc-prize__eyebrow-icon" />
        {t("prizes.label")}
      </span>
      {prizes.map((kind) => {
        if (kind === "cash") {
          const label = t("prizes.cash");
          return (
            <span
              key={kind}
              className="wc-prize__chip wc-prize__chip--cash"
              title={label}
            >
              <Coins className="wc-prize__icon" aria-hidden />
              <span className="wc-prize__label">{label}</span>
              {COIN_PARTICLES.map((coin, i) => (
                <span
                  key={i}
                  className="wc-prize__coin"
                  style={
                    { "--wc-delay": coin.delay, "--wc-x": coin.x } as CSSProperties
                  }
                  aria-hidden
                >
                  $
                </span>
              ))}
            </span>
          );
        }

        if (kind === "nitro") {
          const label = t("prizes.nitro");
          return (
            <span
              key={kind}
              className="wc-prize__chip wc-prize__chip--nitro"
              title={label}
            >
              <Gem className="wc-prize__icon" aria-hidden />
              <span className="wc-prize__label">{label}</span>
            </span>
          );
        }

        const label = t("prizes.customRole");
        return (
          <span
            key={kind}
            className="wc-prize__chip wc-prize__chip--role"
            title={label}
          >
            <span className="wc-prize__role-dot" aria-hidden />
            <span className="wc-prize__label">{label}</span>
          </span>
        );
      })}
    </span>
  );
}

function Podium({
  rows,
  t,
  currentUserId,
  badgesByUser,
}: {
  rows: LeaderboardRow[];
  t: LeaderboardT;
  currentUserId?: string;
  badgesByUser: Map<string, BadgeKey[]>;
}) {
  const leadGap = rows[0].total_points - rows[1].total_points;

  const places: Array<{
    displayRank: 1 | 2 | 3;
    row: LeaderboardRow;
    medal: PodiumMedal;
  }> = [
    { displayRank: 2, row: rows[1], medal: "silver" },
    { displayRank: 1, row: rows[0], medal: "gold" },
    { displayRank: 3, row: rows[2], medal: "bronze" },
  ];

  return (
    <section className="wc-podium-cards pt-3">
      <div className="grid grid-cols-2 gap-3 px-2 sm:grid-cols-3 sm:items-end sm:gap-3 [direction:ltr]">
        {places.map((place) => {
          const isChampion = place.displayRank === 1;
          const mine = place.row.user_id === currentUserId;
          const achievements = badgesByUser.get(place.row.user_id) ?? [];
          const ariaLabel = isChampion
            ? `${t("champion")}: ${place.row.full_name}, ${place.row.total_points} ${t("pointsShort")}`
            : `${t("rank")} ${place.displayRank}: ${place.row.full_name}, ${place.row.total_points} ${t("pointsShort")}`;

          return (
            <Link
              key={place.row.user_id}
              href={`/leaderboard/${place.row.user_id}`}
              aria-label={ariaLabel}
              className={cn(
                "wc-fut-card group",
                `wc-fut-card--${place.medal}`,
                isChampion &&
                  "order-first col-span-2 wc-fut-card--champion sm:order-none sm:col-span-1",
                mine && "wc-fut-card--mine",
              )}
            >
              {/* Rating + place mark (FUT corner) */}
              <span className="flex w-full items-start justify-between">
                <span className="flex flex-col items-center leading-none">
                  <span
                    className={cn(
                      "wc-fut-card__points font-black tabular-nums",
                      isChampion ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
                    )}
                    data-points={place.row.total_points}
                  >
                    {place.row.total_points}
                  </span>
                  <span className="mt-0.5 text-[0.55rem] font-bold tracking-widest uppercase opacity-70">
                    {t("pointsShort")}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <span
                    className={cn(
                      isChampion
                        ? "wc-fut-card__rank-badge"
                        : "wc-fut-card__mark text-xl leading-none sm:text-2xl",
                    )}
                    aria-hidden
                    dir="ltr"
                  >
                    {isChampion ? (
                      "1"
                    ) : (
                      MEDAL_EMOJI[place.medal]
                    )}
                  </span>
                  {isChampion && leadGap > 0 ? (
                    <span className="wc-fut-card__lead tabular-nums">
                      +{leadGap} {t("ahead")}
                    </span>
                  ) : null}
                </span>
              </span>

              {/* Photo */}
              <span
                className={cn(
                  "wc-fut-card__photo",
                  isChampion && "wc-fut-card__photo--champion",
                )}
              >
                {isChampion ? (
                  <>
                    <span
                      className="wc-fut-card__sparkle wc-fut-card__sparkle--one"
                      aria-hidden
                    />
                    <span
                      className="wc-fut-card__sparkle wc-fut-card__sparkle--two"
                      aria-hidden
                    />
                    <span
                      className="wc-fut-card__sparkle wc-fut-card__sparkle--three"
                      aria-hidden
                    />
                    <span
                      className="wc-fut-card__sparkle wc-fut-card__sparkle--four"
                      aria-hidden
                    />
                  </>
                ) : null}
                <Avatar
                  src={place.row.avatar_url}
                  name={place.row.full_name}
                  className={cn(
                    "wc-fut-card__avatar",
                    isChampion ? "size-20 text-xl sm:size-24" : "size-16 text-base",
                  )}
                />
                {isChampion ? (
                  <Crown className="wc-fut-card__avatar-crown" aria-hidden />
                ) : null}
              </span>

              {/* Name */}
              <span
                dir="auto"
                className={cn(
                  "max-w-full truncate text-center font-black tracking-tight uppercase leading-tight",
                  isChampion ? "text-sm sm:text-base" : "text-xs sm:text-sm",
                )}
              >
                {place.row.full_name}
                {mine ? ` ${t("you")}` : ""}
              </span>

              {/* Tournament prize */}
              <CardPrize medal={place.medal} t={t} />

              {/* Hall-of-Fame honours */}
              <CardAchievements keys={achievements} t={t} />

              {/* Attributes — FUT-style 6-stat grid */}
              <span className="wc-fut-card__attrs">
                <CardAttr
                  label={t("exactShort")}
                  value={`${place.row.exact_count}`}
                />
                <CardAttr
                  label={t("goalDiffShort")}
                  value={`${place.row.gd_count}`}
                />
                <CardAttr
                  label={t("winnerShort")}
                  value={`${place.row.winner_count}`}
                />
                <CardAttr
                  label={t("accuracyShort")}
                  value={`${accuracyPct(place.row)}%`}
                />
                <CardAttr
                  label={t("playedShort")}
                  value={`${place.row.predictions_made}`}
                />
                <CardAttr
                  label={t("ppgShort")}
                  value={pointsPerMatch(place.row)}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function BoardRow({
  row,
  mine,
  t,
  tier,
}: {
  row: LeaderboardRow;
  mine: boolean;
  t: LeaderboardT;
  tier: RankTier;
}) {
  const tierStyle = BOARD_TIER_STYLES[tier];

  return (
    <li>
      <Link
        href={`/leaderboard/${row.user_id}`}
        className={cn(
          "wc-fixture-card wc-board-card grid gap-3 rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[auto_1fr_auto] sm:items-center",
          tierStyle.card,
          tierStyle.density,
          row.rank === 1 && "wc-board-card--rank1",
          row.rank === 2 && "wc-board-card--rank2",
          row.rank === 4 && "wc-board-card--rank4",
          row.rank === 5 && "wc-board-card--rank5",
          mine && "border-primary/30 bg-primary/5",
        )}
      >
        <span className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-black tabular-nums",
              tierStyle.badge,
            )}
          >
            {row.rank}
          </span>
          <Avatar
            src={row.avatar_url}
            name={row.full_name}
            className={tierStyle.avatar}
          />
        </span>

        <span className="min-w-0 space-y-2">
          <span className="block truncate text-sm font-semibold">
            {row.full_name}
            {mine ? ` ${t("you")}` : ""}
          </span>
          <span className="flex flex-wrap gap-1.5">
            <StatPill label={t("exact")} value={row.exact_count} tone="lime" />
            <StatPill label={t("goalDiff")} value={row.gd_count} tone="gold" />
            <StatPill
              label={t("winner")}
              value={row.winner_count}
              tone="emerald"
            />
            <StatPill label={t("miss")} value={row.miss_count} />
            <StatPill
              label={t("predictionsMade")}
              value={row.predictions_made}
            />
          </span>
        </span>

        <span className="flex items-end justify-between gap-3 sm:flex-col sm:justify-center sm:text-end">
          <span className="inline-flex items-center gap-1.5">
            {row.rank === 1 ? (
              <Trophy className="size-5 text-gold" aria-hidden />
            ) : null}
            <span className={cn("font-black tabular-nums", tierStyle.points)}>
              {row.total_points}
            </span>
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {t("pointsShort")}
          </span>
        </span>
      </Link>
    </li>
  );
}

export default async function LeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const activeTab: Tab =
    query.tab === "hall-of-fame"
      ? "hall-of-fame"
      : query.tab === "my-results"
        ? "my-results"
        : "board";
  const [leaderboard, user, t, scoringT, appSettings] = await Promise.all([
    getLeaderboard(),
    getCurrentUser(),
    getTranslations("leaderboard"),
    getTranslations("scoring"),
    getAppSettings(),
  ]);
  const currentUserId = user?.id;
  const myRow = currentUserId
    ? leaderboard.find((row) => row.user_id === currentUserId)
    : undefined;
  const hasPodium = leaderboard.length >= 3;
  const fieldRows = hasPodium ? leaderboard.slice(3) : leaderboard;
  // Standing = 1-based position in the full board. The podium shows the first 3
  // cards, so the field list continues from standing 4 (or 1 with no podium).
  const startStanding = hasPodium ? 4 : 1;
  const boardSections = tierSections(fieldRows, startStanding, t);

  // Display-only mirror of the scoring tiers (DB stays the source of truth).
  const scoringPoints = {
    exact: appSettings.exact_points,
    margin: appSettings.goal_diff_points,
    winner: appSettings.winner_points,
  };

  let myProfile: MemberProfile | null = null;
  let myResults: UserResult[] | null = null;
  let teams: Team[] | null = null;
  let playerStats: PlayerStats | null = null;
  let hallBadges: Badge[] | null = null;
  let hallSetupPending = false;
  // Hall-of-Fame honours mapped to their current holder, for the podium cards.
  const podiumBadges = new Map<string, BadgeKey[]>();

  if (activeTab === "hall-of-fame") {
    try {
      const memberStats = await getMemberStats();
      hallBadges = computeHallOfFame(memberStats);
    } catch (error) {
      if (error instanceof MemberStatsUnavailableError) {
        hallSetupPending = true;
      } else {
        throw error;
      }
    }
  }

  // Decorate the top-3 cards with any awards their holders currently own. The
  // member-stats RPC is optional, so a missing function just means no honours.
  if (activeTab === "board" && hasPodium) {
    try {
      const memberStats = await getMemberStats();
      for (const badge of computeHallOfFame(memberStats)) {
        if (!badge.holderUserId) continue;
        const owned = podiumBadges.get(badge.holderUserId) ?? [];
        owned.push(badge.key);
        podiumBadges.set(badge.holderUserId, owned);
      }
    } catch (error) {
      if (!(error instanceof MemberStatsUnavailableError)) throw error;
    }
  }

  if (activeTab === "my-results" && currentUserId && myRow) {
    const [results, teamRows] = await Promise.all([
      getUserResults(currentUserId),
      listTeams(),
    ]);
    myProfile = {
      id: myRow.user_id,
      full_name: myRow.full_name,
      avatar_url: myRow.avatar_url,
    };
    myResults = results;
    teams = teamRows;
    playerStats = computePlayerStats(results, appSettings.exact_points);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="space-y-3">
          <span className="wc-page-kicker">
            <Trophy className="size-4" aria-hidden />
            {t("title")}
          </span>
          <h1 className="text-3xl font-black tracking-normal sm:text-4xl">
            {t("title")}
          </h1>
        </div>
        {myRow ? (
          <div className="flex flex-wrap gap-2 md:justify-end">
            <span className="wc-field-chip">
              {t("rank")}
              <span className="font-black tabular-nums">#{myRow.rank}</span>
            </span>
            <span className="wc-field-chip text-primary">
              {t("pointsShort")}
              <span className="font-black tabular-nums">
                {myRow.total_points}
              </span>
            </span>
            <span className="wc-field-chip">
              {t("exact")}
              <span className="font-black tabular-nums">
                {myRow.exact_count}
              </span>
            </span>
          </div>
        ) : null}
      </div>

      <section className="space-y-3 rounded-2xl border bg-card/95 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-primary" aria-hidden />
          <h2 className="text-sm font-semibold">{scoringT("title")}</h2>
        </div>
        <ScoringStrip points={scoringPoints} />
        <p className="text-xs text-muted-foreground">{scoringT("footnote")}</p>
      </section>

      <div className="space-y-3">
        <nav
          aria-label={t("tabsLabel")}
          className="grid grid-cols-3 rounded-full border bg-card/85 p-1 shadow-sm"
        >
          <TabLink tab="board" activeTab={activeTab} label={t("boardTab")} />
          <TabLink
            tab="hall-of-fame"
            activeTab={activeTab}
            label={t("hallOfFameTab")}
          />
          <TabLink
            tab="my-results"
            activeTab={activeTab}
            label={t("myResultsTab")}
          />
        </nav>
      </div>

      {activeTab === "board" ? (
        leaderboard.length === 0 ? (
          <EmptyState
            icon={<Trophy className="size-8" aria-hidden />}
            title={t("empty")}
            description={t("emptyDescription")}
          />
        ) : (
          <div className="space-y-5">
            {hasPodium ? (
              <Podium
                rows={leaderboard.slice(0, 3)}
                t={t}
                currentUserId={currentUserId}
                badgesByUser={podiumBadges}
              />
            ) : null}

            {boardSections.length > 0 ? (
              <div className="space-y-4">
                {boardSections.map((section) => (
                  <section key={section.tier} className="space-y-2.5">
                    <h2 className="wc-page-kicker">{section.label}</h2>
                    <ol
                      className={cn(
                        "space-y-2.5",
                        section.tier === "rest" && "space-y-2",
                      )}
                    >
                      {section.rows.map((row) => (
                        <BoardRow
                          key={row.user_id}
                          row={row}
                          mine={row.user_id === currentUserId}
                          t={t}
                          tier={section.tier}
                        />
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
            ) : null}
          </div>
        )
      ) : activeTab === "hall-of-fame" && hallSetupPending ? (
        <EmptyState
          icon={<Trophy className="size-8" aria-hidden />}
          title={t("hallOfFame.setupPendingTitle")}
          description={t("hallOfFame.setupPendingDescription")}
        />
      ) : activeTab === "hall-of-fame" && hallBadges ? (
        <HallOfFame badges={hallBadges} locale={locale} />
      ) : myProfile && myRow && myResults && teams && playerStats ? (
        <ResultsBreakdown
          profile={myProfile}
          stats={myRow}
          results={myResults}
          teams={teams}
          locale={locale}
          playerStats={playerStats}
          settings={appSettings}
          isCurrentUser
        />
      ) : (
        <EmptyState
          icon={<Trophy className="size-8" aria-hidden />}
          title={t("emptyResults")}
          description={t("emptyResultsDescription")}
        />
      )}
    </div>
  );
}
