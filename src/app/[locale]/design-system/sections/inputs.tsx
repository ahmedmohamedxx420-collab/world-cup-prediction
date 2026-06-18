import { Calendar, ChevronDown, Mail, Search, Upload } from "lucide-react";
import {
  DsButton,
  DsCard,
  DsCheckbox,
  DsInput,
  DsOtpInput,
  DsRadio,
  DsToggle,
} from "../components";

export function InputsSection({
  smartAlerts,
  onSmartAlertsChange,
}: {
  smartAlerts: boolean;
  onSmartAlertsChange: (enabled: boolean) => void;
}) {
  return (
    <section className="ds-section" id="inputs" aria-labelledby="inputs-title">
      <div className="ds-section__header">
        <span className="ds-kicker">04</span>
        <h2 id="inputs-title">Inputs and Forms</h2>
        <p>Soft fields, clear helper states, and compact mobile controls.</p>
      </div>
      <div className="ds-grid ds-grid--two">
        <DsCard>
          <div className="ds-form-stack">
            <DsInput label="Full name" placeholder="Cooper George" />
            <DsInput
              label="Email"
              placeholder="cooper@orbace.co"
              type="email"
              leadingIcon={<Mail aria-hidden />}
              success="Verified business email"
            />
            <DsInput
              label="Search"
              placeholder="Search transactions"
              leadingIcon={<Search aria-hidden />}
            />
            <DsInput
              label="Card number"
              placeholder="4921 9482 2094 3011"
              error="Card number is incomplete"
            />
          </div>
        </DsCard>

        <DsCard>
          <div className="ds-form-stack">
            <label className="ds-field">
              <span className="ds-label">One-time code</span>
              <DsOtpInput value="5289" />
              <span className="ds-helper">Two digits remaining</span>
            </label>
            <label className="ds-field">
              <span className="ds-label">Account type</span>
              <span className="ds-select-shell">
                Premium Checking
                <ChevronDown aria-hidden />
              </span>
            </label>
            <DsInput
              label="Transfer date"
              defaultValue="2026-06-18"
              type="date"
              leadingIcon={<Calendar aria-hidden />}
            />
            <div className="ds-upload">
              <Upload aria-hidden />
              <div>
                <strong>Upload statement</strong>
                <span>PDF, PNG, JPG up to 10 MB</span>
              </div>
              <DsButton variant="secondary">Browse</DsButton>
            </div>
          </div>
        </DsCard>

        <DsCard className="ds-choice-panel">
          <DsCheckbox checked label="Remember trusted device" />
          <DsCheckbox checked={false} label="Share monthly digest" />
          <DsRadio checked label="Instant transfer" name="speed" />
          <DsRadio checked={false} label="Standard transfer" name="speed" />
          <DsToggle
            checked={smartAlerts}
            label="Smart alerts"
            onChange={onSmartAlertsChange}
          />
        </DsCard>
      </div>
    </section>
  );
}
