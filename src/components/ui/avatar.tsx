import * as React from "react";

import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function Avatar({
  className,
  src,
  name,
  alt = "",
  ...props
}: React.ComponentProps<"span"> & {
  src?: string | null;
  name: string;
  alt?: string;
}) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20",
        className,
      )}
      {...props}
    >
      {src ? (
        // Plain img keeps Supabase public storage URLs independent from Next's
        // remote image allow-list.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span
          dir="ltr"
          className="flex size-full items-center justify-center select-none"
        >
          {getInitials(name)}
        </span>
      )}
    </span>
  );
}

export { Avatar, getInitials };
