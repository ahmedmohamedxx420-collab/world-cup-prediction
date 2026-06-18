import { ArrowUpRight, CreditCard, Receipt, ShieldCheck, Wallet } from "lucide-react";
import {
  BarChart,
  DsAvatar,
  DsBadge,
  DsCard,
  DsChip,
  DsProgress,
  DsStat,
  IconContainer,
} from "../components";

export function CardsSection() {
  return (
    <section className="ds-section" id="cards" aria-labelledby="cards-title">
      <div className="ds-section__header">
        <span className="ds-kicker">05</span>
        <h2 id="cards-title">Cards</h2>
        <p>White cards for utility, gradient cards for owned-money moments.</p>
      </div>
      <div className="ds-grid ds-grid--three">
        <DsCard>
          <div className="ds-card-title">
            <IconContainer icon={Wallet} tone="lime" />
            <span>Balance</span>
          </div>
          <strong className="ds-money">$12,849.20</strong>
          <DsProgress value={68} label="68% monthly goal" />
        </DsCard>

        <DsCard variant="gradient">
          <div className="ds-card-title">
            <IconContainer icon={CreditCard} tone="white" />
            <span>Orbace Black</span>
          </div>
          <p>**** 2408</p>
          <div className="ds-card-chip" aria-hidden />
          <div className="ds-card-row">
            <span>Valid thru</span>
            <strong>12/29</strong>
          </div>
        </DsCard>

        <DsCard clickable>
          <div className="ds-card-title">
            <IconContainer icon={Receipt} tone="emerald" />
            <span>Transaction</span>
            <ArrowUpRight aria-hidden className="ds-inline-icon" />
          </div>
          <div className="ds-transaction-row">
            <DsAvatar initials="AP" tone="charcoal" />
            <div>
              <strong>App Store</strong>
              <span>30 min ago, earn</span>
            </div>
            <b>$4.99</b>
          </div>
        </DsCard>

        <DsCard>
          <div className="ds-profile-card">
            <DsAvatar initials="CG" tone="emerald" />
            <div>
              <strong>Cooper George</strong>
              <span>Premium member</span>
            </div>
            <DsBadge tone="lime">VIP</DsBadge>
          </div>
          <div className="ds-chip-row">
            <DsChip active>Retail</DsChip>
            <DsChip>Travel</DsChip>
            <DsChip>Dining</DsChip>
          </div>
        </DsCard>

        <DsCard>
          <div className="ds-stat-row">
            <DsStat label="Saved" value="$8.4k" delta="+8%" />
            <DsStat label="Rewards" value="$420" delta="+14%" />
          </div>
        </DsCard>

        <DsCard variant="gradient">
          <div className="ds-card-title">
            <IconContainer icon={ShieldCheck} tone="lime" />
            <span>Risk score</span>
          </div>
          <BarChart
            data={[
              { label: "M", value: 34 },
              { label: "T", value: 48 },
              { label: "W", value: 42 },
              { label: "T", value: 76, highlight: true },
              { label: "F", value: 51 },
            ]}
          />
        </DsCard>

        <DsCard className="ds-empty-card">
          <IconContainer icon={Wallet} tone="muted" size="lg" />
          <strong>No pending transfers</strong>
          <span>Your next scheduled transfer appears here.</span>
        </DsCard>
      </div>
    </section>
  );
}
