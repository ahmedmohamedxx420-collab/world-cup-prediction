import {
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import type { DesignSystemInteractions } from "../design-system";
import { DsButton, DsCard, IconContainer } from "../components";

export function FeedbackSection({
  interactions,
}: {
  interactions: DesignSystemInteractions;
}) {
  return (
    <section
      className="ds-section"
      id="feedback"
      aria-labelledby="feedback-title"
    >
      <div className="ds-section__header">
        <span className="ds-kicker">09</span>
        <h2 id="feedback-title">Feedback and States</h2>
        <p>Local demos for toast, alerts, modal, loading, empty, and errors.</p>
      </div>
      <div className="ds-grid ds-grid--two">
        <DsCard>
          <div className="ds-action-row">
            <DsButton onClick={() => interactions.setToastVisible(true)}>
              Show Toast
            </DsButton>
            <DsButton
              variant="secondary"
              onClick={() => interactions.setModalOpen(true)}
            >
              Open Modal
            </DsButton>
          </div>
          {interactions.toastVisible ? (
            <div className="ds-toast" role="status">
              <IconContainer icon={CheckCircle} tone="lime" />
              <div>
                <strong>Transfer scheduled</strong>
                <span>$1,240 leaves checking tomorrow.</span>
              </div>
              <button
                aria-label="Dismiss toast"
                onClick={() => interactions.setToastVisible(false)}
                type="button"
              >
                <X aria-hidden />
              </button>
            </div>
          ) : null}
        </DsCard>

        <DsCard>
          <div className="ds-alert ds-alert--success">
            <CheckCircle aria-hidden />
            <span>Identity check completed.</span>
          </div>
          <div className="ds-alert ds-alert--warning">
            <AlertCircle aria-hidden />
            <span>Large transfer requires review.</span>
          </div>
          <div className="ds-alert ds-alert--info">
            <Info aria-hidden />
            <span>New savings rule is active.</span>
          </div>
        </DsCard>

        <DsCard>
          <div className="ds-skeleton-stack" aria-label="Skeleton loading state">
            <span />
            <span />
            <span />
          </div>
          <div className="ds-spinner-row">
            <Loader2 className="ds-spin" aria-hidden />
            <span>Syncing secure balances</span>
          </div>
        </DsCard>

        <DsCard className="ds-empty-card">
          <IconContainer icon={ShieldCheck} tone="lime" size="lg" />
          <strong>All clear</strong>
          <span>No security issues found on this account.</span>
        </DsCard>
      </div>

      {interactions.modalOpen ? (
        <div className="ds-modal-backdrop" role="presentation">
          <div
            aria-labelledby="confirm-transfer-title"
            aria-modal="true"
            className="ds-modal"
            role="dialog"
          >
            <div className="ds-card-title">
              <IconContainer icon={ShieldCheck} tone="lime" />
              <span id="confirm-transfer-title">Confirm transfer</span>
            </div>
            <p>
              Move $1,240.00 from Checking to Savings. Confirmation appears in
              the activity timeline.
            </p>
            <div className="ds-action-row">
              <DsButton onClick={() => interactions.setModalOpen(false)}>
                Confirm
              </DsButton>
              <DsButton
                variant="secondary"
                onClick={() => interactions.setModalOpen(false)}
              >
                Cancel
              </DsButton>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
