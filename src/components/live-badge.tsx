import { cn } from "@/lib/utils";

// Small "match in progress" indicator: a pulsing dot + label. Pure markup, so it
// renders in server components. Uses red (the universal "live now" cue) which
// also stands apart from the app's green theme.
export function LiveBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400",
        className,
      )}
    >
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500/60" />
        <span className="relative inline-flex size-2 rounded-full bg-red-500" />
      </span>
      {label}
    </span>
  );
}
