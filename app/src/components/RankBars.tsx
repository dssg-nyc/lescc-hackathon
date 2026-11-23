import type { CSSProperties } from "react";
import "./RankBars.css";

export interface RankRow {
  label: string;
  value: number;
  display: string;
  tone?: "baseline" | "proposal";
}

/** Ranked horizontal bars. Bars scale from 0 (transform only), staggered. */
export function RankBars({ label, rows }: { label: string; rows: readonly RankRow[] }) {
  const max = Math.max(...rows.map((r) => r.value), 0) || 1;
  return (
    <ol className="rank" aria-label={label}>
      {rows.map((row, i) => (
        <li key={row.label} className="rank-row" data-tone={row.tone} style={{ "--i": i } as CSSProperties}>
          <span className="rank-n">{i + 1}</span>
          <span className="rank-label">{row.label}</span>
          <span className="rank-value">{row.display}</span>
          <span className="rank-bar" aria-hidden="true">
            <span className="rank-bar-fill" style={{ "--scale": String(Math.round((row.value / max) * 1000) / 1000) } as CSSProperties} />
          </span>
        </li>
      ))}
    </ol>
  );
}
