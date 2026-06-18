import { type ReactNode } from "react";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SoccerBall } from "@/components/ui/soccer-ball";

// Stadium-style match hero: pitch gradient with drifting grass stripes, a
// sweeping floodlight, a faint goal-net mesh, a floating/spinning ball, and the
// two teams with their score or "vs". A calmer single-banner version of the
// design tab's StadiumBanner. Presentational + server-safe; all motion is
// CSS-only and pauses under reduced motion.
export function MatchBanner({
  homeName,
  awayName,
  homeFlag,
  awayFlag,
  centerLabel,
  statusLabel,
  venue,
  topStart,
  topEnd,
  children,
  className,
}: {
  homeName: string;
  awayName: string;
  homeFlag?: string | null;
  awayFlag?: string | null;
  /** The score (e.g. "1 — 0") or a placeholder like "vs". */
  centerLabel: string;
  /** Small line under the score: a clock, kickoff time, or stage. */
  statusLabel?: string;
  venue?: string | null;
  topStart?: ReactNode;
  topEnd?: ReactNode;
  /** Footer slot, e.g. a primary CTA. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "wc-banner bg-pitch grid gap-4 rounded-2xl border border-white/15 p-5 text-white shadow-lg",
        className,
      )}
    >
      <span className="wc-banner__pitch" aria-hidden />
      <span className="wc-banner__floodlight" aria-hidden />
      <span className="wc-banner__net" aria-hidden />

      {topStart || topEnd ? (
        <div className="flex items-center justify-between gap-2">
          <span className="flex flex-wrap items-center gap-2">{topStart}</span>
          {topEnd}
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <div className="grid min-w-0 justify-items-center gap-1.5 text-center">
          {homeFlag ? (
            <span className="text-4xl leading-none drop-shadow-md" aria-hidden>
              {homeFlag}
            </span>
          ) : null}
          <span className="max-w-full truncate text-sm font-black">
            {homeName}
          </span>
        </div>

        <div className="grid justify-items-center gap-1">
          <span className="wc-banner__ball size-10">
            <SoccerBall className="wc-ball-svg" />
          </span>
          <strong className="text-2xl font-black tabular-nums tracking-wide">
            {centerLabel}
          </strong>
          {statusLabel ? (
            <span className="text-xs font-bold text-lime">{statusLabel}</span>
          ) : null}
        </div>

        <div className="grid min-w-0 justify-items-center gap-1.5 text-center">
          {awayFlag ? (
            <span className="text-4xl leading-none drop-shadow-md" aria-hidden>
              {awayFlag}
            </span>
          ) : null}
          <span className="max-w-full truncate text-sm font-black">
            {awayName}
          </span>
        </div>
      </div>

      {venue || children ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {venue ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
              <CalendarClock className="size-3.5" aria-hidden />
              {venue}
            </span>
          ) : (
            <span />
          )}
          {children}
        </div>
      ) : null}
    </div>
  );
}
