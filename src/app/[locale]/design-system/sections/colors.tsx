import { DsCard, Swatch } from "../components";

const colors = [
  {
    name: "Pitch Emerald",
    value: "#0a3a2b",
    usage: "Gradient base, hero/stadium cards, deep surfaces.",
  },
  {
    name: "Forest Green",
    value: "#14533c",
    usage: "Gradient lift, active dark panels.",
  },
  {
    name: "Neon Lime",
    value: "#c6f24e",
    usage: "Energy accent: live, momentum, primary action, active nav.",
  },
  {
    name: "Fresh Lime",
    value: "#b4e832",
    usage: "Pressed states, secondary highlights.",
  },
  {
    name: "Champion Gold",
    value: "#f4c54a",
    usage: "Achievement accent: trophy, champion, winner, points earned.",
  },
  {
    name: "Deep Gold",
    value: "#e0a92e",
    usage: "Gold gradient end, leading scores, medal shadow.",
  },
  {
    name: "White",
    value: "#ffffff",
    usage: "Cards, inputs, elevated sheet surfaces.",
  },
  {
    name: "Off White",
    value: "#f7f8f6",
    usage: "Nested soft surfaces and chip backgrounds.",
  },
  {
    name: "App Gray",
    value: "#eef1ee",
    usage: "Page canvas, phone mockup backdrop.",
  },
  {
    name: "Charcoal",
    value: "#0f1a14",
    usage: "Primary text and deep icon strokes.",
  },
  {
    name: "Muted Gray",
    value: "#6b7770",
    usage: "Captions, inactive nav, helper text.",
  },
  {
    name: "Subtle Border",
    value: "#e6eae7",
    usage: "Fine dividers, input borders, table lines.",
  },
  {
    name: "Success",
    value: "#19a974",
    usage: "Positive deltas, successful states.",
  },
  {
    name: "Warning",
    value: "#d79722",
    usage: "Review states and attention markers.",
  },
] as const;

export function ColorsSection() {
  return (
    <section className="ds-section" id="colors" aria-labelledby="colors-title">
      <div className="ds-section__header">
        <span className="ds-kicker">01</span>
        <h2 id="colors-title">Colors</h2>
        <p>
          Scoped palette tokens: an emerald pitch base, a neon-lime energy
          accent (live / momentum), and a championship-gold achievement accent
          (trophy / winner / points).
        </p>
      </div>
      <DsCard>
        <div className="ds-swatch-grid">
          {colors.map((color) => (
            <Swatch key={color.name} {...color} />
          ))}
        </div>
      </DsCard>
    </section>
  );
}
