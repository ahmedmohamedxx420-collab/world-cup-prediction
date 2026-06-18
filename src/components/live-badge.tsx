import { cn } from "@/lib/utils";

// Small "match in progress" indicator: a pulsing dot + label. Pure markup, so it
// renders in server components and follows the app's emerald/lime match theme.
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
        "inline-flex items-center gap-1.5 rounded-full border border-lime/55 bg-lime px-2 py-0.5 text-xs font-black text-lime-foreground shadow-[0_8px_18px_rgba(198,242,78,0.26)]",
        className,
      )}
    >
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/50" />
        <span className="relative inline-flex size-2 rounded-full bg-primary" />
      </span>
      {label}
    </span>
  );
}
