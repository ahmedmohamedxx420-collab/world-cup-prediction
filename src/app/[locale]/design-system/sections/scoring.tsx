"use client";

import { useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Info,
  MoveHorizontal,
  Target,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import { DsCard, IconContainer } from "../components";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Sample copy for the design tab only. In the real app the point values come
// from the `app_settings` row (exact / goal-diff / winner), never hard-coded.
type TierKey = "exact" | "margin" | "winner" | "miss";

type Tier = {
  key: TierKey;
  icon: LucideIcon;
  title: string;
  blurb: string;
  points: number;
  // A prediction that lands in this tier when the real result is 2-1.
  example: string;
};

const TIERS: Tier[] = [
  {
    key: "exact",
    icon: Target,
    title: "Exact score",
    blurb: "Both numbers spot on.",
    points: 7,
    example: "2-1",
  },
  {
    key: "margin",
    icon: MoveHorizontal,
    title: "Right margin",
    blurb: "Correct goal gap & winner.",
    points: 4,
    example: "1-0",
  },
  {
    key: "winner",
    icon: Check,
    title: "Right winner",
    blurb: "Correct side, wrong margin.",
    points: 2,
    example: "3-0",
  },
  {
    key: "miss",
    icon: X,
    title: "Miss",
    blurb: "Wrong outcome.",
    points: 0,
    example: "1-2",
  },
];

function PtsPill({ points }: { points: number }) {
  return (
    <span className="ds-score-pts">
      <strong>{points}</strong>
      <small>pts</small>
    </span>
  );
}

// Variant A — vertical ladder, color-coded accent rail, point pill on the end.
function VariantLadder() {
  return (
    <DsCard className="ds-score-block">
      <div className="ds-card-title">
        <IconContainer icon={Trophy} tone="lime" />
        <span>How points work</span>
      </div>
      <div className="ds-score-ladder">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.key}
              className={cx("ds-score-tier", `is-${tier.key}`)}
            >
              <span className="ds-score-tier__icon">
                <Icon aria-hidden />
              </span>
              <span className="ds-score-tier__body">
                <strong>{tier.title}</strong>
                <span>{tier.blurb}</span>
              </span>
              <PtsPill points={tier.points} />
            </div>
          );
        })}
      </div>
      <p className="ds-score-foot">
        <Info aria-hidden />
        We check top to bottom — the first match wins, points never stack.
      </p>
    </DsCard>
  );
}

// Variant B — teach by example. One real result, four predictions mapped to it.
function VariantExample() {
  return (
    <DsCard className="ds-score-block">
      <div className="ds-card-title">
        <IconContainer icon={Target} tone="emerald" />
        <span>Scoring by example</span>
      </div>
      <div className="ds-score-actual">
        <span>Real result</span>
        <strong>2-1</strong>
      </div>
      <div className="ds-score-maps">
        {TIERS.map((tier) => (
          <div
            key={tier.key}
            className={cx("ds-score-map", `is-${tier.key}`)}
          >
            <span className="ds-score-map__guess">{tier.example}</span>
            <span className="ds-score-map__arrow" aria-hidden>
              →
            </span>
            <span className="ds-score-map__label">{tier.title}</span>
            <span className="ds-score-map__pts">+{tier.points}</span>
          </div>
        ))}
      </div>
    </DsCard>
  );
}

// Variant C — collapsible "How points work" disclosure (the smallest footprint
// for the predict page; shown interactive so both states are visible).
function VariantAccordion() {
  const [open, setOpen] = useState(true);
  return (
    <DsCard className="ds-score-block">
      <button
        type="button"
        className={cx("ds-score-disclosure", open && "is-open")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="ds-score-disclosure__title">
          <IconContainer icon={Info} tone="lime" />
          How points work
        </span>
        <ChevronDown className="ds-score-disclosure__chev" aria-hidden />
      </button>
      {open ? (
        <div className="ds-score-disclosure__body">
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              className={cx("ds-score-line", `is-${tier.key}`)}
            >
              <span className="ds-score-line__dot" aria-hidden />
              <span className="ds-score-line__title">{tier.title}</span>
              <span className="ds-score-line__blurb">{tier.blurb}</span>
              <span className="ds-score-line__pts">{tier.points}</span>
            </div>
          ))}
        </div>
      ) : null}
    </DsCard>
  );
}

// Variant D — four punchy stat cards, big number first. Most scannable.
function VariantCards() {
  return (
    <div className="ds-score-cardgrid">
      {TIERS.map((tier) => {
        const Icon = tier.icon;
        return (
          <DsCard
            key={tier.key}
            className={cx("ds-score-card", `is-${tier.key}`)}
          >
            <span className="ds-score-card__top">
              <span className="ds-score-card__icon">
                <Icon aria-hidden />
              </span>
              <span className="ds-score-card__num">{tier.points}</span>
            </span>
            <strong className="ds-score-card__title">{tier.title}</strong>
            <span className="ds-score-card__blurb">{tier.blurb}</span>
          </DsCard>
        );
      })}
    </div>
  );
}

// Variant E — ultra-compact horizontal strip; fits under the score steppers.
function VariantStrip() {
  return (
    <DsCard className="ds-score-block">
      <div className="ds-card-title">
        <IconContainer icon={Trophy} tone="lime" />
        <span>Points at a glance</span>
      </div>
      <div className="ds-score-strip">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          return (
            <span
              key={tier.key}
              className={cx("ds-score-seg", `is-${tier.key}`)}
            >
              <span className="ds-score-seg__num">{tier.points}</span>
              <span className="ds-score-seg__label">
                <Icon aria-hidden />
                {tier.title}
              </span>
            </span>
          );
        })}
      </div>
    </DsCard>
  );
}

function Subgroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="ds-section__subhead">
      <h3 className="ds-subhead">{title}</h3>
      {children}
    </div>
  );
}

export function ScoringSection() {
  return (
    <section className="ds-section" id="scoring" aria-labelledby="scoring-title">
      <div className="ds-section__header">
        <span className="ds-kicker">13</span>
        <h2 id="scoring-title">Scoring Explainers</h2>
        <p>
          Five ways to teach the prediction scoring — exact 7, right margin 4,
          right winner 2, miss 0. Pick the layout you like; it becomes a single
          reusable component that reads its numbers from app settings. Sample
          data only.
        </p>
      </div>

      <Subgroup title="A · Tiered ladder">
        <div className="ds-grid ds-grid--two">
          <VariantLadder />
          <VariantExample />
        </div>
      </Subgroup>

      <Subgroup title="B · Compact disclosure & strip">
        <div className="ds-grid ds-grid--two">
          <VariantAccordion />
          <VariantStrip />
        </div>
      </Subgroup>

      <Subgroup title="C · Stat cards">
        <VariantCards />
      </Subgroup>
    </section>
  );
}
