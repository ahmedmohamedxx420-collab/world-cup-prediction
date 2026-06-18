// A classic black-and-white panel ball drawn as inline SVG so it scales and
// spins crisply at any size. Lifted from the design tab
// (`design-system/sections/football-motion.tsx`) so the real app can reuse it
// outside the `.ds-root` scope. Purely decorative — always `aria-hidden`.
export function SoccerBall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden role="img">
      <defs>
        <radialGradient id="wcBallShine" cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="64%" stopColor="#eef1ee" />
          <stop offset="100%" stopColor="#c4cdc6" />
        </radialGradient>
        <clipPath id="wcBallClip">
          <circle cx="50" cy="50" r="45" />
        </clipPath>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="url(#wcBallShine)"
        stroke="#0f1a14"
        strokeWidth="2.4"
      />
      <g
        clipPath="url(#wcBallClip)"
        fill="#0f1a14"
        stroke="#0f1a14"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <polygon points="50,32 63,41 58,57 42,57 37,41" />
        <g fill="none">
          <path d="M50 32 L50 9" />
          <path d="M63 41 L84 30" />
          <path d="M58 57 L70 80" />
          <path d="M42 57 L30 80" />
          <path d="M37 41 L16 30" />
        </g>
        <polygon points="50,4 61,12 57,1 43,1 39,12" />
        <polygon points="92,28 96,42 86,34 84,22 94,18" />
        <polygon points="74,86 62,92 72,80 84,84 82,94" />
        <polygon points="26,86 16,82 18,92 30,92 38,80" />
        <polygon points="8,28 6,18 16,22 14,34 4,42" />
      </g>
    </svg>
  );
}
