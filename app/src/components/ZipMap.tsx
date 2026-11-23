import { useMemo, type CSSProperties } from "react";
import { binFor, quantileBreaks } from "../lib/choropleth";
import type { LngLat } from "../lib/geo";
import "./ZipMap.css";

export interface ZipShape {
  zip: string;
  polygons: number[][][][]; // MultiPolygon coordinates, [lng, lat]
  ratio: number | null;
}

interface ZipMapProps {
  zips: readonly ZipShape[];
  highlight: string;
  center: LngLat;
  radiusMiles: number; // half-height of the visible area
  title: string;
  mode?: "outline" | "choropleth";
  pin?: LngLat;
  rings?: readonly number[];
  dots?: { restaurants: readonly LngLat[]; cultural: readonly LngLat[] };
  legend?: string;
}

const H = 600;
const ASPECT = 16 / 10;
const W = Math.round(H * ASPECT);
const MI_PER_DEG_LAT = 69.0;
const BINS = 5;

/** Equirectangular projection around the view center, scaled so radiusMiles fills half the height. */
function projector(center: LngLat, radiusMiles: number) {
  const [lng0, lat0] = center;
  const k = H / 2 / (radiusMiles / MI_PER_DEG_LAT);
  const cos = Math.cos((lat0 * Math.PI) / 180);
  return ([lng, lat]: readonly number[]): [number, number] => [W / 2 + (lng - lng0) * cos * k, H / 2 - (lat - lat0) * k];
}

function toPath(polygons: number[][][][], project: (p: readonly number[]) => [number, number]): string {
  return polygons
    .map((poly) => poly.map((ring) => ring.map((p, i) => `${i ? "L" : "M"}${project(p).map((n) => n.toFixed(1)).join(",")}`).join("") + "Z").join(""))
    .join("");
}

/**
 * Line-art ZIP map (311 Wrapped style): thin ZIP outlines, no tiles.
 * "outline": highlighted ZIP filled, pin, dots. "choropleth": ZIPs shaded by ratio, rings on top.
 */
export function ZipMap({ zips, highlight, center, radiusMiles, title, mode = "outline", pin, rings = [], dots, legend }: ZipMapProps) {
  const project = useMemo(() => projector(center, radiusMiles), [center, radiusMiles]);
  const breaks = useMemo(() => quantileBreaks(zips.flatMap((z) => (z.ratio === null ? [] : [z.ratio])), BINS), [zips]);
  const paths = useMemo(
    () => zips.map((z) => ({ zip: z.zip, d: toPath(z.polygons, project), bin: binFor(z.ratio, breaks), ratio: z.ratio })),
    [zips, project, breaks],
  );
  const pinXY = pin ? project(pin) : null;
  const ringPx = (miles: number) => (H / 2) * (miles / radiusMiles);
  const [cx, cy] = project(center);
  const hl = paths.find((p) => p.zip === highlight);
  const ordered = [...paths.filter((p) => p.zip !== highlight), ...(hl ? [hl] : [])];

  return (
    <figure className="zipmap" data-mode={mode}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} preserveAspectRatio="xMidYMid slice"
        style={{ "--ox": `${pinXY?.[0] ?? cx}px`, "--oy": `${pinXY?.[1] ?? cy}px` } as CSSProperties}>
        <g className="zipmap-zoom">
          {ordered.map((p) => (
            <path key={p.zip} d={p.d} data-zip={p.zip}
              data-bin={mode === "choropleth" ? (p.bin === null ? "none" : String(p.bin)) : undefined}
              className={p.zip === highlight ? "zip zip-highlight" : "zip"} />
          ))}
          {dots?.restaurants.map((c, i) => {
            const [x, y] = project(c);
            return <circle key={`r${i}`} className="dot-rest" cx={x} cy={y} r={2.2} />;
          })}
          {dots?.cultural.map((c, i) => {
            const [x, y] = project(c);
            return <circle key={`c${i}`} className="dot-cult" cx={x} cy={y} r={3.4} />;
          })}
          {rings.map((m, i) => (
            <g key={m} style={{ "--i": i } as CSSProperties} className="zip-ring-g">
              <circle className="zip-ring" cx={cx} cy={cy} r={ringPx(m)} />
              <text className="zip-ring-label" x={cx} y={cy - ringPx(m) - 6} textAnchor="middle">{m} mi</text>
            </g>
          ))}
          {pinXY && (
            <g className="zip-pin" transform={`translate(${pinXY[0]} ${pinXY[1]})`}>
              <path className="zip-pin-head" d="M0,0 C-4,-10 -16,-18 -16,-32 A16,16 0 1 1 16,-32 C16,-18 4,-10 0,0Z" />
              <circle className="zip-pin-eye" cx={0} cy={-32} r={6} />
              <circle className="zip-pin-base" r={5} />
            </g>
          )}
        </g>
      </svg>
      {mode === "choropleth" && legend && (
        <figcaption className="zipmap-legend">
          <span>{legend}</span>
          <span className="zipmap-scale" aria-hidden="true">
            fewer
            <span className="zipmap-ramp">{Array.from({ length: BINS }, (_, i) => <i key={i} data-bin={i} />)}</span>
            more
          </span>
          {hl && <span className="sr-only">ZIP {highlight}: {hl.ratio ?? "no data"} restaurants per cultural organization.</span>}
        </figcaption>
      )}
      {mode === "outline" && dots && (
        <figcaption className="zipmap-legend zipmap-legend-dots">
          <span><i className="key key-rest" aria-hidden="true" /> Restaurant</span>
          <span><i className="key key-cult" aria-hidden="true" /> Cultural organization</span>
        </figcaption>
      )}
    </figure>
  );
}
