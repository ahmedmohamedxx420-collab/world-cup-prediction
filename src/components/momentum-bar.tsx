import { cn } from "@/lib/utils";

// Two-sided share / momentum bar with a sweeping lime highlight. Used for live
// possession-style splits and as a generic comparison bar. The fill width is the
// `start` side's share; the sweep animation pauses under reduced motion.
export function MomentumBar({
  startLabel,
  endLabel,
  startValue,
  endValue,
  caption,
  className,
}: {
  startLabel: string;
  endLabel: string;
  /** 0–100; the fill renders this share from the start side. */
  startValue: number;
  endValue: number;
  caption?: string;
  className?: string;
}) {
  const fill = Math.max(0, Math.min(100, startValue));

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
        <span className="text-xs font-bold">{startLabel}</span>
        <span
          className="wc-momentum__bar border bg-muted"
          role="img"
          aria-label={`${startLabel} ${startValue}% · ${endLabel} ${endValue}%`}
        >
          <span className="wc-momentum__fill" style={{ width: `${fill}%` }}>
            <span className="wc-momentum__sweep" aria-hidden />
          </span>
        </span>
        <span className="text-xs font-bold">{endLabel}</span>
      </div>
      <div className="flex items-center justify-between text-[11px] font-bold uppercase text-muted-foreground">
        <span className="tabular-nums">{startValue}%</span>
        {caption ? <span className="text-foreground">{caption}</span> : null}
        <span className="tabular-nums">{endValue}%</span>
      </div>
    </div>
  );
}
