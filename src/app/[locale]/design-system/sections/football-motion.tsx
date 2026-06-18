import { type CSSProperties, type ReactNode } from "react";
import {
  Activity,
  CalendarClock,
  Check,
  CircleDot,
  Goal,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { DsBadge, DsButton, DsCard, IconContainer } from "../components";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Everything here is invented sample data for the design tab only. All visuals
// are self-contained CSS/SVG (no external images) so the kit stays offline and
// dependency-free, matching the rest of `ds.css`. Motion is paused under
// `prefers-reduced-motion`.

// A classic black-and-white panel ball drawn as inline SVG so it scales and
// spins crisply at any size.
function SoccerBall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden role="img">
      <defs>
        <radialGradient id="dsBallShine" cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="64%" stopColor="#eef1ee" />
          <stop offset="100%" stopColor="#c4cdc6" />
        </radialGradient>
        <clipPath id="dsBallClip">
          <circle cx="50" cy="50" r="45" />
        </clipPath>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="url(#dsBallShine)"
        stroke="#0f1a14"
        strokeWidth="2.4"
      />
      <g
        clipPath="url(#dsBallClip)"
        fill="#0f1a14"
        stroke="#0f1a14"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <polygon points="50,32 63,41 58,57 42,57 37,41" />
        <g fill="none">
          <path d="M50 32 L50 9" />
          <path d="M63 41 L84 30" />
          <path d="M58 57 L70 80" />
          <path d="M42 57 L30 80" />
          <path d="M37 41 L16 30" />
        </g>
        <polygon points="50,4 61,12 57,1 43,1 39,12" />
        <polygon points="92,28 96,42 86,34 84,22 94,18" />
        <polygon points="74,86 62,92 72,80 84,84 82,94" />
        <polygon points="26,86 16,82 18,92 30,92 38,80" />
        <polygon points="8,28 6,18 16,22 14,34 4,42" />
      </g>
    </svg>
  );
}

const CONFETTI_COLORS = [
  "var(--ds-lime-400)",
  "var(--ds-emerald-700)",
  "#f4c54a",
  "var(--ds-white)",
  "var(--ds-rose)",
  "var(--ds-info)",
];

type ConfettiStyle = CSSProperties & {
  "--ds-x"?: string;
  "--ds-delay"?: string;
  "--ds-rot"?: string;
};

// Lightweight CSS confetti: a fixed set of pieces with varied position, colour,
// delay, and spin. Used by the goal and champion moments.
function Confetti({ count = 24 }: { count?: number }) {
  return (
    <span className="ds-confetti" aria-hidden>
      {Array.from({ length: count }).map((_, index) => {
        const style: ConfettiStyle = {
          left: `${(index / count) * 100}%`,
          background: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
          "--ds-delay": `${(index % 8) * 0.32}s`,
          "--ds-rot": `${(index % 2 ? 1 : -1) * (180 + (index % 5) * 90)}deg`,
        };
        return (
          <span
            className={cx("ds-confetti__bit", index % 3 === 0 && "is-round")}
            key={index}
            style={style}
          />
        );
      })}
    </span>
  );
}

function StadiumBanner() {
  return (
    <div className="ds-stadium">
      <span className="ds-stadium__pitch" aria-hidden />
      <span className="ds-stadium__floodlight" aria-hidden />
      <span className="ds-stadium__net" aria-hidden />

      <div className="ds-stadium__top">
        <span className="ds-pill ds-pill--glass">
          <Sparkles aria-hidden />
          Matchday atmosphere
        </span>
        <span className="ds-live-badge">
          <span className="ds-live-badge__dot" aria-hidden />
          Live
        </span>
      </div>

      <div className="ds-stadium__scene">
        <div className="ds-stadium__team">
          <span className="ds-stadium__flag" aria-hidden>
            🇧🇷
          </span>
          <span className="ds-stadium__name">Brazil</span>
        </div>

        <div className="ds-stadium__center">
          <span className="ds-stadium__ball">
            <SoccerBall className="ds-ball-svg" />
          </span>
          <strong className="ds-stadium__score">1 — 0</strong>
          <span className="ds-stadium__clock">62&apos;</span>
        </div>

        <div className="ds-stadium__team">
          <span className="ds-stadium__flag" aria-hidden>
            🇭🇷
          </span>
          <span className="ds-stadium__name">Croatia</span>
        </div>
      </div>

      <div className="ds-stadium__foot">
        <span className="ds-stadium__venue">
          <CalendarClock aria-hidden />
          Aurora Stadium · Group H
        </span>
        <DsButton icon={<Goal aria-hidden />}>Predict score</DsButton>
      </div>
    </div>
  );
}

function BallLoaders() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={CircleDot} tone="emerald" />
        <span>Ball loaders &amp; motion</span>
      </div>
      <div className="ds-ball-row">
        <span className="ds-ball-demo">
          <span className="ds-ball ds-ball--spin">
            <SoccerBall className="ds-ball-svg" />
          </span>
          <small>Spin</small>
        </span>
        <span className="ds-ball-demo">
          <span className="ds-ball ds-ball--bounce">
            <span className="ds-ball__inner">
              <SoccerBall className="ds-ball-svg" />
            </span>
            <span className="ds-ball__shadow" aria-hidden />
          </span>
          <small>Bounce</small>
        </span>
        <span className="ds-ball-demo">
          <span className="ds-ball ds-ball--sm ds-ball--spin">
            <SoccerBall className="ds-ball-svg" />
          </span>
          <small>Inline</small>
        </span>
      </div>
      <div className="ds-roll-track" aria-hidden>
        <span className="ds-roll-ball">
          <SoccerBall className="ds-ball-svg" />
        </span>
      </div>
      <p className="ds-ball-note">
        Use the spinning ball as a page/sync loader; the rolling ball reads as a
        progress strip.
      </p>
    </DsCard>
  );
}

function LiveMomentum() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={Activity} tone="lime" />
        <span>Live momentum</span>
      </div>
      <div className="ds-momentum">
        <span className="ds-momentum__side ds-momentum__side--start">Brazil</span>
        <span className="ds-momentum__bar" aria-label="Possession 58% to 42%">
          <span className="ds-momentum__fill" style={{ width: "58%" }}>
            <span className="ds-momentum__sweep" aria-hidden />
          </span>
        </span>
        <span className="ds-momentum__side ds-momentum__side--end">Croatia</span>
      </div>
      <div className="ds-momentum__legend">
        <span>58%</span>
        <span>Possession</span>
        <span>42%</span>
      </div>
      <div className="ds-ticker" aria-label="Live commentary">
        <span className="ds-ticker__track">
          <span className="ds-ticker__item ds-ticker__item--goal">
            <Zap aria-hidden />
            62&apos; GOAL — Brazil
          </span>
          <span className="ds-ticker__item">58&apos; Yellow card — Croatia</span>
          <span className="ds-ticker__item">44&apos; Corner — Brazil</span>
          <span className="ds-ticker__item ds-ticker__item--goal">
            <Zap aria-hidden />
            62&apos; GOAL — Brazil
          </span>
          <span className="ds-ticker__item">58&apos; Yellow card — Croatia</span>
          <span className="ds-ticker__item">44&apos; Corner — Brazil</span>
        </span>
      </div>
    </DsCard>
  );
}

function GoalBurst() {
  return (
    <DsCard className="ds-goal-card">
      <Confetti count={28} />
      <div className="ds-goal-burst">
        <span className="ds-goal-burst__ring" aria-hidden />
        <span className="ds-goal-burst__word">GOAL!</span>
        <span className="ds-goal-burst__by">Brazil · 62&apos;</span>
      </div>
      <div className="ds-goal-card__foot">
        <DsBadge tone="gold">+7 if you called 1-0</DsBadge>
        <span className="ds-goal-card__hint">
          Celebration moment for a correct exact-score reveal.
        </span>
      </div>
    </DsCard>
  );
}

function ChampionTrophy() {
  return (
    <DsCard className="ds-trophy-card">
      <Confetti count={20} />
      <div className="ds-trophy">
        <span className="ds-trophy__halo" aria-hidden />
        <Trophy className="ds-trophy__icon" aria-hidden />
        <span className="ds-trophy__shine" aria-hidden />
      </div>
      <div className="ds-trophy__copy">
        <span className="ds-trophy__flag" aria-hidden>
          🇧🇷
        </span>
        <strong>Brazil</strong>
        <span>Champions 2026</span>
      </div>
      <DsBadge tone="gold">Champions · WC2026 gold</DsBadge>
    </DsCard>
  );
}

type ShootoutKick = "goal" | "miss" | "pending";

function ShootoutMarks({ kicks }: { kicks: ShootoutKick[] }) {
  return (
    <span className="ds-shootout__row">
      {kicks.map((kick, index) => (
        <span
          className={cx("ds-shootout__mark", `is-${kick}`)}
          key={index}
          style={{ "--ds-delay": `${index * 0.12}s` } as ConfettiStyle}
        >
          {kick === "goal" ? (
            <Check aria-hidden />
          ) : kick === "miss" ? (
            <X aria-hidden />
          ) : null}
        </span>
      ))}
    </span>
  );
}

function PenaltyShootout() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={Goal} tone="emerald" />
        <span>Penalty shootout</span>
      </div>
      <div className="ds-shootout">
        <div className="ds-shootout__team">
          <span className="ds-shootout__name">
            <span className="ds-bracket-flag" aria-hidden>
              🇧🇷
            </span>
            Brazil
          </span>
          <ShootoutMarks kicks={["goal", "goal", "miss", "goal", "pending"]} />
          <b className="ds-shootout__count is-lead">3</b>
        </div>
        <div className="ds-shootout__team">
          <span className="ds-shootout__name">
            <span className="ds-bracket-flag" aria-hidden>
              🇳🇱
            </span>
            Netherlands
          </span>
          <ShootoutMarks kicks={["goal", "miss", "goal", "miss", "pending"]} />
          <b className="ds-shootout__count">2</b>
        </div>
      </div>
      <span className="ds-shootout__note">Sudden death after 5 kicks each.</span>
    </DsCard>
  );
}

type Kit = {
  team: string;
  flag: string;
  primary: string;
  secondary: string;
  accent: string;
};

const kits: Kit[] = [
  { team: "Brazil", flag: "🇧🇷", primary: "#f6d416", secondary: "#1f7554", accent: "#1b3a8f" },
  { team: "Croatia", flag: "🇭🇷", primary: "#ffffff", secondary: "#d94b55", accent: "#1b3a8f" },
  { team: "Argentina", flag: "🇦🇷", primary: "#7cc0e6", secondary: "#ffffff", accent: "#0f1a14" },
  { team: "France", flag: "🇫🇷", primary: "#1b3a8f", secondary: "#ffffff", accent: "#d94b55" },
];

function Jersey({ kit }: { kit: Kit }) {
  return (
    <svg viewBox="0 0 100 100" className="ds-kit__svg" aria-hidden role="img">
      <path
        d="M35 14 L20 22 L13 40 L24 46 L27 38 L27 86 L73 86 L73 38 L76 46 L87 40 L80 22 L65 14 L58 20 Q50 27 42 20 Z"
        fill={kit.primary}
        stroke="#0f1a14"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M42 20 Q50 27 58 20 L58 30 Q50 36 42 30 Z"
        fill={kit.secondary}
        stroke="#0f1a14"
        strokeWidth="1.6"
      />
      <rect x="44" y="48" width="12" height="12" rx="3" fill={kit.accent} />
    </svg>
  );
}

function KitSwatches() {
  return (
    <DsCard>
      <div className="ds-card-title">
        <IconContainer icon={Sparkles} tone="lime" />
        <span>Team kit swatches</span>
      </div>
      <div className="ds-kit-grid">
        {kits.map((kit) => (
          <div className="ds-kit" key={kit.team}>
            <Jersey kit={kit} />
            <span className="ds-kit__name">
              <span aria-hidden>{kit.flag}</span>
              {kit.team}
            </span>
            <span className="ds-kit__chips" aria-hidden>
              <span style={{ background: kit.primary }} />
              <span style={{ background: kit.secondary }} />
              <span style={{ background: kit.accent }} />
            </span>
          </div>
        ))}
      </div>
      <p className="ds-ball-note">
        SVG kits derive from each team&apos;s colours — handy for avatars,
        match headers, and per-team theming.
      </p>
    </DsCard>
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

export function FootballMotionSection() {
  return (
    <section
      className="ds-section"
      id="atmosphere"
      aria-labelledby="atmosphere-title"
    >
      <div className="ds-section__header">
        <span className="ds-kicker">13</span>
        <h2 id="atmosphere-title">Atmosphere &amp; Motion</h2>
        <p>
          Football-flavoured motion and imagery — a living stadium banner,
          spinning-ball loaders, goal and champion moments, live momentum, a
          shootout tracker, and SVG team kits. All pure CSS/SVG, theme-matched,
          and paused under reduced-motion. Sample data only.
        </p>
      </div>

      <StadiumBanner />

      <Subgroup title="Motion &amp; loaders">
        <div className="ds-grid ds-grid--two">
          <BallLoaders />
          <LiveMomentum />
        </div>
      </Subgroup>

      <Subgroup title="Moments">
        <div className="ds-grid ds-grid--two">
          <GoalBurst />
          <ChampionTrophy />
        </div>
      </Subgroup>

      <Subgroup title="Match details">
        <div className="ds-grid ds-grid--two">
          <PenaltyShootout />
          <KitSwatches />
        </div>
      </Subgroup>
    </section>
  );
}
