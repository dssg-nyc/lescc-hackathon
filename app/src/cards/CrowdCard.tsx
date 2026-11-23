import { CountUp } from "../components/CountUp";
import type { StoryData } from "../data/schema";
import { fmtInt } from "./format";

export function CrowdCard({ data }: { data: StoryData["foot.json"] }) {
  const { latest, station, series } = data;
  const totals = series.filter((p) => p.total !== null);
  const max = Math.max(...totals.map((p) => p.total ?? 0));
  const where = `${station.street} between ${station.from} and ${station.to}`;
  return (
    <>
      <p className="card-number"><CountUp value={latest.total} /></p>
      <p className="card-sub">
        people in the {latest.period} count: {fmtInt(latest.am)} morning, {fmtInt(latest.md)} midday, {fmtInt(latest.pm)} evening.
      </p>
      <svg className="spark" viewBox={`0 0 ${totals.length * 6} 40`} role="img"
        aria-label={`Counts per period from ${totals[0]?.period} to ${latest.period}`}>
        {totals.map((p, i) => {
          const h = ((p.total ?? 0) / max) * 38;
          return <rect key={p.period} x={i * 6} y={40 - h} width={4} height={h} rx={1}
            className={i === totals.length - 1 ? "spark-last" : undefined} />;
        })}
      </svg>
      <p className="card-meta">{where}, {station.miles_from_site} mi from the site. {totals[0]?.period} to {latest.period}.</p>
    </>
  );
}
