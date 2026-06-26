import Image from "next/image";
import { cn } from "@/lib/utils";

// The "Sudanship" brand lockup: the kicking-player artwork above/beside the
// wordmark rendered in the Bebas Neue display font. Reused compactly in the app
// header and large on the splash hero. `tone="dark"` brightens the wordmark for
// the dark pitch background (splash); the default tone suits light surfaces.
type BrandWordmarkProps = {
  size?: "sm" | "hero";
  tone?: "light" | "dark";
  className?: string;
  name?: string;
};

const SIZES = {
  sm: {
    img: "h-10 w-auto",
    text: "text-3xl sm:text-4xl",
    gap: "gap-2.5",
  },
  hero: {
    img: "h-56 w-auto sm:h-72 lg:h-80",
    text: "text-8xl sm:text-9xl",
    gap: "gap-1",
  },
} as const;

export function BrandWordmark({
  size = "sm",
  tone = "light",
  className,
  name = "Sudanship",
}: BrandWordmarkProps) {
  const s = SIZES[size];
  const stacked = size === "hero";

  const image = (
    <Image
      src="/sudanship-banner.png"
      alt={name}
      width={1916}
      height={821}
      priority={size === "hero"}
      className={cn("shrink-0 object-contain", s.img)}
    />
  );

  return (
    <span
      className={cn(
        "flex min-w-0 items-center",
        stacked ? "flex-col gap-3 sm:gap-4" : s.gap,
        className,
      )}
    >
      {stacked ? (
        <span className="wc-splash__art flex items-center justify-center">
          {image}
        </span>
      ) : (
        image
      )}
      <span
        className={cn(
          "wc-wordmark",
          tone === "dark" && "wc-wordmark--on-dark",
          s.text,
        )}
      >
        {name}
      </span>
    </span>
  );
}
