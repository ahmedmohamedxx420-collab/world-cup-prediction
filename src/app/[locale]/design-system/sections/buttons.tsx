import { Bell, Download, Plus, Send } from "lucide-react";
import { DsButton, DsCard } from "../components";

export function ButtonsSection() {
  return (
    <section className="ds-section" id="buttons" aria-labelledby="buttons-title">
      <div className="ds-section__header">
        <span className="ds-kicker">03</span>
        <h2 id="buttons-title">Buttons</h2>
        <p>Primary lime actions, quiet secondary commands, and icon controls.</p>
      </div>
      <DsCard>
        <div className="ds-component-grid">
          <DsButton icon={<Send aria-hidden />}>Send Money</DsButton>
          <DsButton variant="secondary" icon={<Plus aria-hidden />}>
            Add Money
          </DsButton>
          <DsButton variant="ghost">Ghost</DsButton>
          <DsButton variant="icon" aria-label="Notifications">
            <Bell aria-hidden />
          </DsButton>
          <DsButton variant="pill" icon={<Download aria-hidden />}>
            Statement
          </DsButton>
          <DsButton variant="fab" aria-label="New transfer">
            <Plus aria-hidden />
          </DsButton>
          <DsButton disabled>Disabled</DsButton>
          <DsButton loading>Loading</DsButton>
          <DsButton pressed>Pressed</DsButton>
        </div>
      </DsCard>
    </section>
  );
}
