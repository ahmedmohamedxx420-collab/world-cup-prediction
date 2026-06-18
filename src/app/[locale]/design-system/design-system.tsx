"use client";

import { useState } from "react";
import { ArrowUpRight, Landmark, Sparkles } from "lucide-react";
import "./ds.css";
import { DsButton, DsCard, DsStat, IconContainer } from "./components";
import { ButtonsSection } from "./sections/buttons";
import { CardsSection } from "./sections/cards";
import { ChartsSection } from "./sections/charts";
import { ColorsSection } from "./sections/colors";
import { DataDisplaySection } from "./sections/data-display";
import { FeedbackSection } from "./sections/feedback";
import { FootballMotionSection } from "./sections/football-motion";
import { IconsSection } from "./sections/icons";
import { InputsSection } from "./sections/inputs";
import { NavigationSection } from "./sections/navigation";
import { PreviewsSection } from "./sections/previews";
import { TypographySection } from "./sections/typography";
import { WorldCupSection } from "./sections/world-cup";

export type DsTab = "overview" | "cards" | "insights";
export type DsSegment = "weekly" | "monthly" | "yearly";

export type DesignSystemInteractions = {
  activeTab: DsTab;
  setActiveTab: (tab: DsTab) => void;
  segment: DsSegment;
  setSegment: (segment: DsSegment) => void;
  smartAlerts: boolean;
  setSmartAlerts: (enabled: boolean) => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  toastVisible: boolean;
  setToastVisible: (visible: boolean) => void;
};

const sectionLinks = [
  ["colors", "Colors"],
  ["typography", "Typography"],
  ["buttons", "Buttons"],
  ["inputs", "Inputs"],
  ["cards", "Cards"],
  ["navigation", "Navigation"],
  ["data-display", "Data"],
  ["charts", "Charts"],
  ["feedback", "Feedback"],
  ["icons", "Icons"],
  ["previews", "Layouts"],
  ["world-cup", "World Cup"],
  ["atmosphere", "Atmosphere"],
] as const;

export function DesignSystem() {
  const [activeTab, setActiveTab] = useState<DsTab>("overview");
  const [segment, setSegment] = useState<DsSegment>("weekly");
  const [smartAlerts, setSmartAlerts] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(true);

  const interactions: DesignSystemInteractions = {
    activeTab,
    setActiveTab,
    segment,
    setSegment,
    smartAlerts,
    setSmartAlerts,
    modalOpen,
    setModalOpen,
    toastVisible,
    setToastVisible,
  };

  return (
    <div className="ds-root" dir="ltr">
      <div className="ds-shell">
        <aside className="ds-sidebar" aria-label="Design system sections">
          <div className="ds-sidebar__brand">
            <IconContainer icon={Landmark} tone="lime" />
            <div>
              <span>Neobank UI</span>
              <small>Internal kit</small>
            </div>
          </div>
          <nav className="ds-section-nav">
            {sectionLinks.map(([id, label]) => (
              <a href={`#${id}`} key={id}>
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="ds-main">
          <section className="ds-hero" aria-labelledby="design-system-title">
            <div className="ds-hero__copy">
              <div className="ds-eyebrow">
                <Sparkles aria-hidden />
                Premium fintech reference
              </div>
              <h1 id="design-system-title">Design System</h1>
              <p>
                A standalone visual kit for crisp white banking surfaces, deep
                emerald cards, neon-lime emphasis, soft shadows, and minimal
                line iconography.
              </p>
              <div className="ds-hero__actions">
                <DsButton icon={<ArrowUpRight aria-hidden />}>Explore Kit</DsButton>
                <DsButton variant="secondary">Scoped Route</DsButton>
              </div>
            </div>

            <DsCard variant="gradient" className="ds-hero-card">
              <div className="ds-hero-card__top">
                <span>Available Balance</span>
                <span className="ds-pill ds-pill--glass">Live</span>
              </div>
              <strong>$918,380.70</strong>
              <div className="ds-mini-card-stack" aria-hidden>
                <span />
                <span />
              </div>
              <div className="ds-stat-row">
                <DsStat label="Income" value="$43.6k" delta="+12.4%" />
                <DsStat label="Spend" value="$18.9k" delta="-3.1%" />
              </div>
            </DsCard>
          </section>

          <ColorsSection />
          <TypographySection />
          <ButtonsSection />
          <InputsSection
            smartAlerts={smartAlerts}
            onSmartAlertsChange={setSmartAlerts}
          />
          <CardsSection />
          <NavigationSection interactions={interactions} />
          <DataDisplaySection />
          <ChartsSection segment={segment} />
          <FeedbackSection interactions={interactions} />
          <IconsSection />
          <PreviewsSection interactions={interactions} />
          <WorldCupSection />
          <FootballMotionSection />
        </main>
      </div>
    </div>
  );
}
