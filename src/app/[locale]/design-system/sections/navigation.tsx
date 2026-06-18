import {
  ArrowLeft,
  Bell,
  CreditCard,
  Home,
  Landmark,
  MoreHorizontal,
  Receipt,
  Settings,
  User,
} from "lucide-react";
import type { DesignSystemInteractions, DsSegment, DsTab } from "../design-system";
import { DsButton, DsCard, IconContainer } from "../components";

const tabs: Array<{ label: string; value: DsTab }> = [
  { label: "Overview", value: "overview" },
  { label: "Cards", value: "cards" },
  { label: "Insights", value: "insights" },
];

const segments: Array<{ label: string; value: DsSegment }> = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

export function NavigationSection({
  interactions,
}: {
  interactions: DesignSystemInteractions;
}) {
  return (
    <section
      className="ds-section"
      id="navigation"
      aria-labelledby="navigation-title"
    >
      <div className="ds-section__header">
        <span className="ds-kicker">06</span>
        <h2 id="navigation-title">Navigation</h2>
        <p>Mobile-first navigation with compact desktop equivalents.</p>
      </div>
      <div className="ds-grid ds-grid--two">
        <DsCard>
          <div className="ds-mobile-header">
            <DsButton variant="icon" aria-label="Back">
              <ArrowLeft aria-hidden />
            </DsButton>
            <strong>Request Money</strong>
            <DsButton variant="icon" aria-label="More">
              <MoreHorizontal aria-hidden />
            </DsButton>
          </div>
          <div className="ds-tabs" role="tablist">
            {tabs.map((tab) => (
              <button
                aria-selected={interactions.activeTab === tab.value}
                className={interactions.activeTab === tab.value ? "is-active" : ""}
                key={tab.value}
                onClick={() => interactions.setActiveTab(tab.value)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="ds-segmented" aria-label="Period">
            {segments.map((item) => (
              <button
                className={interactions.segment === item.value ? "is-active" : ""}
                key={item.value}
                onClick={() => interactions.setSegment(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </DsCard>

        <DsCard>
          <div className="ds-top-nav">
            <div className="ds-sidebar__brand">
              <IconContainer icon={Landmark} tone="lime" />
              <div>
                <span>Orbace</span>
                <small>Personal banking</small>
              </div>
            </div>
            <div className="ds-top-nav__actions">
              <DsButton variant="icon" aria-label="Notifications">
                <Bell aria-hidden />
              </DsButton>
              <DsButton variant="icon" aria-label="Settings">
                <Settings aria-hidden />
              </DsButton>
            </div>
          </div>
          <div className="ds-bottom-nav" aria-label="Mobile bottom navigation">
            <button className="is-active" type="button">
              <Home aria-hidden />
              <span>Home</span>
            </button>
            <button type="button">
              <CreditCard aria-hidden />
              <span>Cards</span>
            </button>
            <button className="ds-bottom-nav__fab" type="button">
              <Receipt aria-hidden />
              <span>Pay</span>
            </button>
            <button type="button">
              <Settings aria-hidden />
              <span>Tools</span>
            </button>
            <button type="button">
              <User aria-hidden />
              <span>User</span>
            </button>
          </div>
          <p className="ds-note">
            Desktop navigation keeps the same hierarchy with quieter chrome and
            larger hit targets.
          </p>
        </DsCard>
      </div>
    </section>
  );
}
