"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

// Mobile-only fixed bottom navigation. Hidden at md+ where the header nav takes
// over (see MainNav).
export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_28px_rgba(15,26,20,0.08)] backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 md:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {navItems.map(({ key, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-xs font-bold transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-all",
                    active
                      ? "bg-lime-grad text-lime-foreground shadow-lime"
                      : "text-current",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span>{t(key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
