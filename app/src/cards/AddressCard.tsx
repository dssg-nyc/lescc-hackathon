import { useMemo } from "react";
import { StreetMap } from "../components/StreetMap";
import type { LngLat } from "../lib/geo";
import type { StoryData } from "../data/schema";
import { fmtInt } from "./format";

const HALF_MILE = [0.5] as const;
const LOT_CLASS: Record<string, string> = { Q1: "park building" };

export function AddressCard({ data }: { data: StoryData["site.json"] }) {
  const [street, ...rest] = data.address.split(", ");
  const lot = data.lot;
  const center = useMemo<LngLat>(() => [data.lon, data.lat], [data.lon, data.lat]);
  return (
    <div className="map-card">
      <StreetMap center={center} rings={HALF_MILE} startClose title={`Map: pin at ${data.address}, with the half-mile ring`} />
      <div>
        <p className="address-block">{street.toUpperCase()}</p>
        <p className="card-sub">{rest.join(", ")}</p>
        {lot?.bldgclass && (
          <p className="card-meta">
            Tax lot {data.bbl}: {LOT_CLASS[lot.bldgclass] ?? "class"} ({lot.bldgclass}), {fmtInt(lot.bldgarea)} sq ft.
          </p>
        )}
        <ol className="timeline" aria-label="History">
          {data.timeline.map((p) => (
            <li key={p.text} data-status={p.status}>
              <span className="timeline-year">{p.year ?? "?"}</span>
              <span>
                {p.text}{" "}
                {p.status === "to_research" ? <em className="timeline-tag">To research</em>
                  : <span className="timeline-src">{p.source}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
