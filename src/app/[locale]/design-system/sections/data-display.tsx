import { ArrowDownLeft, ArrowUpRight, Crown, TrendingUp } from "lucide-react";
import {
  DsAvatar,
  DsBadge,
  DsCard,
  DsChip,
  DsProgress,
  DsStat,
  IconContainer,
} from "../components";

const transactions = [
  ["App Store", "Digital purchase", "$4.99", "success"],
  ["Sip Coffee", "Food and drink", "$10.00", "neutral"],
  ["Uber", "Transport", "$95.00", "warning"],
] as const;

const leaderboard = [
  ["01", "Maya Chen", "$18.4k", "MC"],
  ["02", "Ryan Park", "$16.2k", "RP"],
  ["03", "Nora Fox", "$14.9k", "NF"],
] as const;

export function DataDisplaySection() {
  return (
    <section
      className="ds-section"
      id="data-display"
      aria-labelledby="data-display-title"
    >
      <div className="ds-section__header">
        <span className="ds-kicker">07</span>
        <h2 id="data-display-title">Data Display</h2>
        <p>Readable money data with compact status, user, and progress patterns.</p>
      </div>
      <div className="ds-grid ds-grid--two">
        <DsCard>
          <div className="ds-card-title">
            <IconContainer icon={TrendingUp} tone="lime" />
            <span>Transactions</span>
          </div>
          <div className="ds-list">
            {transactions.map(([name, detail, amount, tone]) => (
              <div className="ds-transaction-row" key={name}>
                <IconContainer
                  icon={tone === "success" ? ArrowDownLeft : ArrowUpRight}
                  tone={tone === "warning" ? "muted" : "emerald"}
                />
                <div>
                  <strong>{name}</strong>
                  <span>{detail}</span>
                </div>
                <b>{amount}</b>
              </div>
            ))}
          </div>
        </DsCard>

        <DsCard>
          <div className="ds-card-title">
            <IconContainer icon={Crown} tone="lime" />
            <span>Leaderboard</span>
          </div>
          <div className="ds-list">
            {leaderboard.map(([rank, name, amount, initials]) => (
              <div className="ds-leader-row" key={rank}>
                <span>{rank}</span>
                <DsAvatar initials={initials} tone="emerald" />
                <strong>{name}</strong>
                <b>{amount}</b>
              </div>
            ))}
          </div>
        </DsCard>

        <DsCard className="ds-table-card">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Status</th>
                <th>Limit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Checking</td>
                <td>
                  <DsBadge tone="success">Open</DsBadge>
                </td>
                <td>$25k</td>
              </tr>
              <tr>
                <td>Credit</td>
                <td>
                  <DsBadge tone="warning">Review</DsBadge>
                </td>
                <td>$12k</td>
              </tr>
              <tr>
                <td>Savings</td>
                <td>
                  <DsBadge tone="info">Auto</DsBadge>
                </td>
                <td>$80k</td>
              </tr>
            </tbody>
          </table>
        </DsCard>

        <DsCard>
          <div className="ds-chip-row">
            <DsChip active>Income</DsChip>
            <DsChip>Dining</DsChip>
            <DsChip>Travel</DsChip>
            <DsChip>Crypto</DsChip>
          </div>
          <div className="ds-stat-row">
            <DsStat label="Cashback" value="$128" delta="+18%" />
            <DsStat label="Goal" value="74%" delta="+6%" />
          </div>
          <DsProgress value={74} label="Monthly goal" />
        </DsCard>
      </div>
    </section>
  );
}
