/** 12-to-60-point sparkline: de-emphasis stroke, current value as an accent dot. Server-rendered SVG. */
export default function Sparkline({ values, tone = "neutral" }: { values: number[]; tone?: "pos" | "neg" | "neutral" }) {
  if (!values || values.length < 2) return <svg className="spark" aria-hidden />;
  const w = 160, h = 30, pad = 3;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => pad + (i / (values.length - 1)) * (w - 2 * pad);
  const y = (v: number) => h - pad - ((v - min) / span) * (h - 2 * pad);
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = values[values.length - 1];
  const color = tone === "pos" ? "var(--pos)" : tone === "neg" ? "var(--neg)" : "var(--accent)";
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke="var(--spark)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={x(values.length - 1)} cy={y(last)} r="3" fill={color} stroke="var(--surface-1)" strokeWidth="1.5" />
    </svg>
  );
}
