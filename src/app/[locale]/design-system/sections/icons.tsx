import {
  Bell,
  CalendarDays,
  Clock3,
  Flame,
  Goal,
  ListChecks,
  LockKeyhole,
  Search,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";
import { DsCard, IconContainer } from "../components";

const icons: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Trophy, label: "Trophy" },
  { icon: Goal, label: "Goal" },
  { icon: Target, label: "Target" },
  { icon: Shield, label: "Shield" },
  { icon: Flame, label: "Streak" },
  { icon: CalendarDays, label: "Fixtures" },
  { icon: ListChecks, label: "Results" },
  { icon: Clock3, label: "Kickoff" },
  { icon: TrendingUp, label: "Form" },
  { icon: LockKeyhole, label: "Lock" },
  { icon: Bell, label: "Bell" },
  { icon: Search, label: "Search" },
  { icon: Settings, label: "Settings" },
  { icon: User, label: "User" },
];

export function IconsSection() {
  return (
    <section className="ds-section" id="icons" aria-labelledby="icons-title">
      <div className="ds-section__header">
        <span className="ds-kicker">10</span>
        <h2 id="icons-title">Icons</h2>
        <p>Lucide line icons in rounded containers, with active and muted tones.</p>
      </div>
      <DsCard>
        <div className="ds-icon-grid">
          {icons.map(({ icon, label }, index) => (
            <div className="ds-icon-sample" key={label}>
              <IconContainer
                icon={icon}
                tone={index % 3 === 0 ? "lime" : index % 3 === 1 ? "emerald" : "muted"}
                size={index < 4 ? "lg" : "md"}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </DsCard>
    </section>
  );
}
