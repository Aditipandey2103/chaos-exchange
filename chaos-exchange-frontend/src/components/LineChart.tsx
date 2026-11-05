import { num } from "../format";

const W = 640;
const H = 240;
const PAD = { top: 14, right: 64, bottom: 18, left: 8 };

/** Dependency-free SVG line chart for a series of prices. */
export function LineChart({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <div className="chart-empty">
        Waiting for live price ticks. The chart fills in as updates arrive.
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || max * 0.01 || 1;
  const lo = min - span * 0.1;
  const hi = max + span * 0.1;

  const x = (i: number) => PAD.left + (i / (values.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom);

  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const line = points.join(" ");
  const area = `${x(0).toFixed(1)},${H - PAD.bottom} ${line} ${x(values.length - 1).toFixed(1)},${H - PAD.bottom}`;
  const up = values[values.length - 1] >= values[0];
  const color = up ? "var(--up)" : "var(--down)";
  const ticks = [hi, (hi + lo) / 2, lo];
  const last = values[values.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Price chart">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="grid" />
          <text x={W - PAD.right + 6} y={y(t) + 4} className="axis">
            {num(t)}
          </text>
        </g>
      ))}
      <polygon points={area} fill={color} opacity={0.08} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(last)} r={3.5} fill={color} />
    </svg>
  );
}
