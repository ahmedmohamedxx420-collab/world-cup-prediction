import { DsCard } from "../components";

export function TypographySection() {
  return (
    <section
      className="ds-section"
      id="typography"
      aria-labelledby="typography-title"
    >
      <div className="ds-section__header">
        <span className="ds-kicker">02</span>
        <h2 id="typography-title">Typography</h2>
        <p>Large, calm, high-trust type treatments using the inherited font.</p>
      </div>
      <div className="ds-grid ds-grid--two">
        <DsCard className="ds-type-sample">
          <span className="ds-label">Page title</span>
          <h3 className="ds-type-page">Banking that feels immediate.</h3>
        </DsCard>
        <DsCard className="ds-type-sample">
          <span className="ds-label">Financial number</span>
          <strong className="ds-money">$3,945.50</strong>
          <p>Available balance</p>
        </DsCard>
        <DsCard className="ds-type-sample">
          <span className="ds-label">Section title</span>
          <h3 className="ds-type-section">Cash flow insights</h3>
          <p>
            Body copy stays compact, direct, and muted enough to let account
            data lead.
          </p>
        </DsCard>
        <DsCard className="ds-type-sample">
          <span className="ds-label">Labels and captions</span>
          <span className="ds-caption">Button text / field label / caption</span>
          <button className="ds-text-button" type="button">
            Transfer Money
          </button>
        </DsCard>
      </div>
    </section>
  );
}
