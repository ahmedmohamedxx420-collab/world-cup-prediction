import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A clear, tappable "back" control: an outlined button with a direction-aware
// arrow (flips for RTL) instead of a faint text link that blends into the page.
// Server-component friendly — no client hooks.
export function BackLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant: "outline" }), "gap-2", className)}
    >
      <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
      {label}
    </Link>
  );
}
