import { CalendarDays, Trophy, User, type LucideIcon } from "lucide-react";

export type NavKey = "fixtures" | "leaderboard" | "profile";

export type NavItem = {
  key: NavKey;
  // Locale-agnostic path; the next-intl <Link> adds the locale prefix.
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { key: "fixtures", href: "/fixtures", icon: CalendarDays },
  { key: "leaderboard", href: "/leaderboard", icon: Trophy },
  { key: "profile", href: "/profile", icon: User },
];
