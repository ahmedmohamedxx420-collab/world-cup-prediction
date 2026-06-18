import {
  ArrowDownLeft,
  Bell,
  CheckCircle,
  CreditCard,
  Plus,
  Receipt,
  Search,
  Send,
  Wallet,
} from "lucide-react";
import type { DesignSystemInteractions } from "../design-system";
import {
  BarChart,
  DsAvatar,
  DsBadge,
  DsButton,
  DsCard,
  DsChip,
  DsInput,
  DsProgress,
  IconContainer,
  PhoneFrame,
} from "../components";

export function PreviewsSection({
  interactions,
}: {
  interactions: DesignSystemInteractions;
}) {
  return (
    <section
      className="ds-section"
      id="previews"
      aria-labelledby="previews-title"
    >
      <div className="ds-section__header">
        <span className="ds-kicker">11</span>
        <h2 id="previews-title">Mini Layouts</h2>
        <p>Mobile screen compositions for dashboard, forms, details, and states.</p>
      </div>
      <div className="ds-phone-grid">
        <PhoneFrame title="Dashboard">
          <div className="ds-preview-header">
            <div>
              <span>Hello, Cooper</span>
              <strong>$3,945.50</strong>
            </div>
            <IconContainer icon={Bell} tone="lime" />
          </div>
          <div className="ds-action-row">
            <DsButton icon={<Send aria-hidden />}>Send</DsButton>
            <DsButton variant="secondary" icon={<Plus aria-hidden />}>
              Add
            </DsButton>
          </div>
          <DsCard variant="gradient" className="ds-phone-card">
            <span>Income</span>
            <strong>$3,890.00</strong>
            <BarChart
              data={[
                { label: "S", value: 45 },
                { label: "M", value: 62 },
                { label: "T", value: 58 },
                { label: "W", value: 80, highlight: true },
              ]}
            />
          </DsCard>
        </PhoneFrame>

        <PhoneFrame title="Transfer">
          <DsInput label="Recipient" placeholder="Maya Chen" />
          <DsInput label="Amount" placeholder="$1,240.00" />
          <div className="ds-chip-row">
            <DsChip>$50</DsChip>
            <DsChip active>$250</DsChip>
            <DsChip>$1k</DsChip>
          </div>
          <DsButton>Continue</DsButton>
        </PhoneFrame>

        <PhoneFrame title="Card Details">
          <DsCard variant="gradient" className="ds-phone-card">
            <IconContainer icon={CreditCard} tone="white" />
            <strong>**** 2408</strong>
            <span>Orbace Black</span>
          </DsCard>
          <div className="ds-list">
            <div className="ds-detail-row">
              <span>Daily limit</span>
              <strong>$8,000</strong>
            </div>
            <DsProgress value={42} label="42% used" />
          </div>
        </PhoneFrame>

        <PhoneFrame title="History">
          <DsInput
            label="Search"
            placeholder="Search"
            leadingIcon={<Search aria-hidden />}
          />
          <div className="ds-list">
            {["App Store", "Sip Coffee", "Uber"].map((name, index) => (
              <div className="ds-transaction-row" key={name}>
                <IconContainer
                  icon={index === 0 ? ArrowDownLeft : Receipt}
                  tone={index === 0 ? "lime" : "emerald"}
                />
                <div>
                  <strong>{name}</strong>
                  <span>{index + 1} day ago</span>
                </div>
                <b>{index === 0 ? "+$4.99" : "-$10.00"}</b>
              </div>
            ))}
          </div>
        </PhoneFrame>

        <PhoneFrame title="Empty">
          <div className="ds-empty-card ds-empty-card--screen">
            <IconContainer icon={Wallet} tone="muted" size="lg" />
            <strong>No cards yet</strong>
            <span>Create a virtual card for safer checkout.</span>
            <DsButton icon={<Plus aria-hidden />}>Create Card</DsButton>
          </div>
        </PhoneFrame>

        <PhoneFrame title="Modal">
          <div className="ds-preview-header">
            <DsAvatar initials="MC" tone="emerald" />
            <DsBadge tone={interactions.smartAlerts ? "success" : "neutral"}>
              {interactions.smartAlerts ? "Alerts on" : "Alerts off"}
            </DsBadge>
          </div>
          <div className="ds-modal ds-modal--inline">
            <IconContainer icon={CheckCircle} tone="lime" />
            <strong>Transfer ready</strong>
            <span>Review details before sending to Maya Chen.</span>
            <DsButton onClick={() => interactions.setToastVisible(true)}>
              Confirm
            </DsButton>
          </div>
        </PhoneFrame>
      </div>
    </section>
  );
}
