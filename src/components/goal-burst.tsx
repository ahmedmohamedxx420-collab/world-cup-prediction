import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";

const CONFETTI_COLORS = [
  "#c6f24e", // lime
  "#1d6f50", // emerald
  "#f4c54a", // gold
  "#ffffff",
  "#d95278", // rose
  "#3977d7", // info
];

type ConfettiStyle = CSSProperties & {
  "--wc-delay"?: string;
  "--wc-rot"?: string;
};

// Lightweight CSS confetti: a fixed set of pieces with varied position, colour,
// delay and spin. Ported from the design tab. Decorative + reduced-motion aware
// (the whole layer is hidden when motion is reduced).
function Confetti({ count = 24 }: { count?: number }) {
  return (
    <span className="wc-confetti" aria-hidden>
      {Array.from({ length: count }).map((_, index) => {
        const style: ConfettiStyle = {
          left: `${(index / count) * 100}%`,
          background: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
          "--wc-delay": `${(index % 8) * 0.32}s`,
          "--wc-rot": `${(index % 2 ? 1 : -1) * (180 + (index % 5) * 90)}deg`,
        };
        return (
          <span
            className={cn("wc-confetti__bit", index % 3 === 0 && "is-round")}
            key={index}
            style={style}
          />
        );
      })}
    </span>
  );
}

// Celebration moment shown sparingly — e.g. when a viewer's exact score was
// correct on a revealed match. Confetti + an expanding lime ring behind a word
// and subtitle. Announced politely; all motion stops under reduced motion.
export function GoalBurst({
  word,
  subtitle,
  className,
}: {
  word: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate grid justify-items-center gap-1 overflow-hidden rounded-2xl border bg-card px-4 py-6 text-center shadow-gold",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Confetti count={28} />
      <span className="relative grid justify-items-center gap-1 py-2">
        <span className="wc-goal-ring" aria-hidden />
        <strong className="bg-pitch bg-clip-text text-4xl font-black leading-none tracking-wider text-transparent">
          {word}
        </strong>
      </span>
      {subtitle ? (
        <span className="relative z-1 text-sm font-semibold text-muted-foreground">
          {subtitle}
        </span>
      ) : null}
    </div>
  );
}
