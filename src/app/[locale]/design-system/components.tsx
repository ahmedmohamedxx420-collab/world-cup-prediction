"use client";

import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from "react";
import { Check, Loader2, type LucideIcon } from "lucide-react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type DsButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "icon"
  | "pill"
  | "fab";

type DsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: DsButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
  pressed?: boolean;
};

export function DsButton({
  variant = "primary",
  icon,
  loading = false,
  pressed = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: DsButtonProps) {
  return (
    <button
      className={cx(
        "ds-button",
        `ds-button--${variant}`,
        pressed && "is-pressed",
        className,
      )}
      disabled={disabled || loading}
      type={type}
      aria-pressed={pressed || undefined}
      {...props}
    >
      {loading ? <Loader2 className="ds-spin" aria-hidden /> : icon}
      {children ? <span className="ds-button__content">{children}</span> : null}
    </button>
  );
}

type DsCardProps = HTMLAttributes<HTMLElement> & {
  variant?: "white" | "gradient" | "muted";
  clickable?: boolean;
};

export function DsCard({
  variant = "white",
  clickable = false,
  className,
  children,
  ...props
}: DsCardProps) {
  return (
    <article
      className={cx(
        "ds-card",
        `ds-card--${variant}`,
        clickable && "ds-card--clickable",
        className,
      )}
      {...props}
    >
      {children}
    </article>
  );
}

type DsInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helper?: string;
  error?: string;
  success?: string;
  leadingIcon?: ReactNode;
};

export function DsInput({
  label,
  helper,
  error,
  success,
  leadingIcon,
  id,
  className,
  ...props
}: DsInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const message = error ?? success ?? helper;

  return (
    <label className="ds-field" htmlFor={inputId}>
      <span className="ds-label">{label}</span>
      <span
        className={cx(
          "ds-input-shell",
          Boolean(leadingIcon) && "has-icon",
          error && "is-error",
          success && "is-success",
        )}
      >
        {leadingIcon ? <span className="ds-input-icon">{leadingIcon}</span> : null}
        <input
          id={inputId}
          className={cx("ds-input", className)}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </span>
      {message ? (
        <span
          className={cx(
            "ds-helper",
            error && "is-error",
            success && "is-success",
          )}
        >
          {message}
        </span>
      ) : null}
    </label>
  );
}

export function DsOtpInput({
  value,
  length = 6,
}: {
  value: string;
  length?: number;
}) {
  const chars = Array.from({ length }, (_, index) => value[index] ?? "");

  return (
    <div className="ds-otp" aria-label="One-time passcode">
      {chars.map((char, index) => (
        <span className={cx("ds-otp__cell", char && "is-filled")} key={index}>
          {char}
        </span>
      ))}
    </div>
  );
}

export function DsToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      className={cx("ds-toggle", checked && "is-on")}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
      aria-checked={checked}
    >
      <span className="ds-toggle__track">
        <span className="ds-toggle__thumb" />
      </span>
      <span>{label}</span>
    </button>
  );
}

export function DsCheckbox({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <label className="ds-choice">
      <input checked={checked} readOnly type="checkbox" />
      <span className="ds-choice__box">
        <Check aria-hidden />
      </span>
      <span>{label}</span>
    </label>
  );
}

export function DsRadio({
  checked,
  label,
  name,
}: {
  checked: boolean;
  label: string;
  name: string;
}) {
  return (
    <label className="ds-choice ds-choice--radio">
      <input checked={checked} name={name} readOnly type="radio" />
      <span className="ds-choice__box" />
      <span>{label}</span>
    </label>
  );
}

type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "lime"
  | "gold";

export function DsBadge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return <span className={cx("ds-badge", `ds-badge--${tone}`)}>{children}</span>;
}

export function DsAvatar({
  initials,
  tone = "emerald",
}: {
  initials: string;
  tone?: "emerald" | "lime" | "blue" | "rose" | "charcoal";
}) {
  return <span className={cx("ds-avatar", `ds-avatar--${tone}`)}>{initials}</span>;
}

export function DsChip({
  active = false,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return <span className={cx("ds-chip", active && "is-active")}>{children}</span>;
}

export function DsProgress({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  return (
    <div className="ds-progress" aria-label={label} aria-valuenow={value}>
      <span className="ds-progress__track">
        <span
          className="ds-progress__bar"
          style={{ "--ds-progress": `${value}%` } as CSSProperties}
        />
      </span>
      {label ? <span>{label}</span> : null}
    </div>
  );
}

export function DsStat({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: string;
}) {
  const negative = delta?.startsWith("-");

  return (
    <div className="ds-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {delta ? (
        <em className={cx(negative ? "is-negative" : "is-positive")}>{delta}</em>
      ) : null}
    </div>
  );
}

export function Swatch({
  name,
  value,
  usage,
}: {
  name: string;
  value: string;
  usage: string;
}) {
  return (
    <div className="ds-swatch">
      <span
        className="ds-swatch__color"
        style={{ "--ds-swatch": value } as CSSProperties}
      />
      <div>
        <strong>{name}</strong>
        <code>{value}</code>
        <p>{usage}</p>
      </div>
    </div>
  );
}

export type BarDatum = {
  label: string;
  value: number;
  highlight?: boolean;
};

export function BarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <div
      className="ds-bars"
      style={{ "--ds-bar-count": data.length } as CSSProperties}
      aria-label="Bar chart"
    >
      {data.map((item) => (
        <div className="ds-bars__item" key={item.label}>
          <span
            className={cx("ds-bars__bar", item.highlight && "is-highlighted")}
            style={
              { "--ds-bar-height": `${(item.value / max) * 100}%` } as CSSProperties
            }
          >
            {item.highlight ? (
              <span className="ds-chart-tooltip">${item.value}k</span>
            ) : null}
          </span>
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ values }: { values: number[] }) {
  const id = useId().replace(/:/g, "");
  const width = 320;
  const height = 150;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1 || 1);
  const points = values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="ds-line-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Line chart"
    >
      <defs>
        <linearGradient id={`ds-line-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#b4e832" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={`url(#ds-line-${id})`} />
      {values.map((value, index) => {
        const x = index * step;
        const y = height - ((value - min) / range) * (height - 20) - 10;
        return <circle cx={x} cy={y} key={`${value}-${index}`} r="4" />;
      })}
    </svg>
  );
}

export function PhoneFrame({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="ds-phone">
      <div className="ds-phone__status">
        <span>9:41</span>
        <span aria-hidden>|||</span>
      </div>
      {title ? <div className="ds-phone__title">{title}</div> : null}
      <div className="ds-phone__screen">{children}</div>
    </div>
  );
}

export function IconContainer({
  icon: Icon,
  tone = "emerald",
  size = "md",
}: {
  icon: LucideIcon;
  tone?: "emerald" | "lime" | "white" | "muted";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span className={cx("ds-icon-chip", `ds-icon-chip--${tone}`, `is-${size}`)}>
      <Icon aria-hidden />
    </span>
  );
}
