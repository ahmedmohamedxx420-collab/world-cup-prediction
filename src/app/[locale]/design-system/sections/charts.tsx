import type { CSSProperties } from "react";
import type { DsSegment } from "../design-system";
import { BarChart, DsBadge, DsCard, DsStat, LineChart } from "../components";

const chartSets: Record<DsSegment, number[]> = {
  weekly: [22, 38, 30, 54, 72, 44, 60],
  monthly: [38, 42, 64, 58, 76, 82, 91],
  yearly: [24, 32, 46, 59, 68, 84, 98],
};

export function ChartsSection({ segment }: { segment: DsSegment }) {
  const selectedValues = chartSets[segment];

  return (
    <section className="ds-section" id="charts" aria-labelledby="charts-title">
      <div className="ds-section__header">
        <span className="ds-kicker">08</span>
        <h2 id="charts-title">Charts</h2>
        <p>Dark emerald insight surfaces with lime-selected data points.</p>
      </div>
      <div className="ds-grid ds-grid--two">
        <DsCard variant="gradient" className="ds-chart-card">
          <div className="ds-card-row">
            <div>
              <span className="ds-label">Income</span>
              <strong className="ds-chart-total">$3,890.00</strong>
            </div>
            <DsBadge tone="lime">{segment}</DsBadge>
          </div>
          <BarChart
            data={[
              { label: "Sun", value: 68 },
              { label: "Mon", value: 55 },
              { label: "Tue", value: 69 },
              { label: "Wed", value: 60 },
              { label: "Thu", value: 88, highlight: true },
              { label: "Fri", value: 48 },
            ]}
          />
        </DsCard>

        <DsCard variant="gradient" className="ds-chart-card">
          <div className="ds-card-row">
            <div>
              <span className="ds-label">Portfolio</span>
              <strong className="ds-chart-total">$48,240</strong>
            </div>
            <DsBadge tone="success">+8.2%</DsBadge>
          </div>
          <LineChart values={selectedValues} />
        </DsCard>

        <DsCard>
          <div className="ds-stat-row">
            <DsStat label="Velocity" value="42%" delta="+4.1%" />
            <DsStat label="Risk" value="Low" delta="-2.0%" />
          </div>
          <div className="ds-spark-row" aria-label="Small summary charts">
            <span style={{ "--spark": "48%" } as CSSProperties} />
            <span style={{ "--spark": "76%" } as CSSProperties} />
            <span style={{ "--spark": "61%" } as CSSProperties} />
            <span style={{ "--spark": "88%" } as CSSProperties} />
          </div>
        </DsCard>
      </div>
    </section>
  );
}
