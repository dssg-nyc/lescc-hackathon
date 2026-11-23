import type { CSSProperties } from "react";
import "./RingMap.css";

const SIZE = 320;
const PAD = 22;

/**
 * Flat SVG ring diagram centred on the site. Radii are to scale with each other
 * (largest ring fills the frame). No basemap: decision 4 in docs/story-cards-plan.md.
 */
export function RingMap({ rings, title }: { rings: readonly number[]; title: string }) {
  const max = Math.max(...rings);
  const c = SIZE / 2;
  const scale = (c - PAD) / max;
  return (
    <svg className="ringmap" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={title}>
      {[...rings].reverse().map((r, i) => (
        <g key={r} className="ring-g" style={{ "--i": rings.length - 1 - i } as CSSProperties}>
          <circle className="ring" cx={c} cy={c} r={r * scale} />
          <text className="ring-label" x={c} y={c - r * scale - 6} textAnchor="middle">
            {r} mi
          </text>
        </g>
      ))}
      <g className="ring-pin" transform={`translate(${c} ${c})`}>
        <circle r={10} className="ring-pin-halo" />
        <circle r={5} className="ring-pin-dot" />
      </g>
    </svg>
  );
}
