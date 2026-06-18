import { cn } from "@/lib/utils";
import { SoccerBall } from "@/components/ui/soccer-ball";

// Spinning / bouncing soccer-ball loader — the football-flavoured replacement
// for the generic `Loader2` spinner. Motion is CSS-only and pauses under
// `prefers-reduced-motion` (see globals.css). Decorative, so callers should
// supply their own visible "loading" text in a live region where needed.
export function BallLoader({
  variant = "spin",
  size = "md",
  className,
  label,
}: {
  variant?: "spin" | "bounce" | "inline";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  if (variant === "inline") {
    return (
      <span
        className={cn("wc-ball wc-ball--inline wc-ball--spin", className)}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        <SoccerBall className="wc-ball-svg" />
      </span>
    );
  }

  const sizeClass =
    size === "sm" ? "wc-ball--sm" : size === "lg" ? "size-20" : undefined;

  return (
    <span
      className={cn(
        "wc-ball",
        sizeClass,
        variant === "spin" ? "wc-ball--spin" : "wc-ball--bounce",
        className,
      )}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {variant === "bounce" ? (
        <>
          <span className="wc-ball__inner">
            <SoccerBall className="wc-ball-svg" />
          </span>
          <span className="wc-ball__shadow" aria-hidden />
        </>
      ) : (
        <SoccerBall className="wc-ball-svg" />
      )}
    </span>
  );
}
