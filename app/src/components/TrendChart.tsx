import "./TrendChart.css";

interface Point {
  year: number;
  value: number;
}
interface Series {
  label: string;
  points: readonly Point[];
}
interface TrendChartProps {
  title: string;
  main: Series;
  reference?: Series;
  projection?: { year: number; low: number; high: number } | null;
}

const W = 320;
const H = 140;
const PAD = { l: 4, r: 40, t: 12, b: 20 };

/** Line chart: main series solid, reference faded, projection as a dashed range band. */
export function TrendChart({ title, main, reference, projection }: TrendChartProps) {
  const all = [...main.points, ...(reference?.points ?? [])];
  const years = all.map((p) => p.year).concat(projection ? [projection.year] : []);
  const values = all.map((p) => p.value).concat(projection ? [projection.low, projection.high] : []);
  const [x0, x1] = [Math.min(...years), Math.max(...years)];
  const [y0, y1] = [0, Math.max(...values) * 1.05];
  const x = (yr: number) => PAD.l + ((yr - x0) / (x1 - x0 || 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => H - PAD.b - ((v - y0) / (y1 - y0)) * (H - PAD.t - PAD.b);
  const path = (pts: readonly Point[]) => pts.map((p, i) => `${i ? "L" : "M"}${x(p.year).toFixed(1)},${y(p.value).toFixed(1)}`).join("");
  const last = main.points[main.points.length - 1];

  return (
    <svg className="trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
      {reference && <path className="trend-ref" d={path(reference.points)} />}
      {projection && (
        <path
          className="trend-band"
          d={`M${x(last.year)},${y(last.value)} L${x(projection.year)},${y(projection.high)} L${x(projection.year)},${y(projection.low)} Z`}
        />
      )}
      <path className="trend-main" d={path(main.points)} pathLength={1} />
      <circle className="trend-dot" cx={x(last.year)} cy={y(last.value)} r={4} />
      <text className="trend-tick" x={x(x0)} y={H - 4}>{x0}</text>
      <text className="trend-tick" x={x(last.year)} y={H - 4} textAnchor="middle">{last.year}</text>
      {projection && <text className="trend-tick" x={x(projection.year)} y={H - 4} textAnchor="end">{projection.year}</text>}
      {reference && (
        <text className="trend-label" x={W - PAD.r + 4} y={y(reference.points[reference.points.length - 1].value) + 4}>
          {reference.label}
        </text>
      )}
    </svg>
  );
}
