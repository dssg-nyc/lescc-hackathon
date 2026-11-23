import { useMemo } from "react";
import { ZipMap } from "../components/ZipMap";
import type { StoryData } from "../data/schema";
import type { LngLat } from "../lib/geo";
import { fmtInt } from "./format";

const LOT_CLASS: Record<string, string> = { Q1: "park building" };
const VIEW_MILES = 0.75;
const DOT_MILES = 1.3; // covers the whole frame, so dots fade with the map edge
const RESTAURANT_SAMPLE = 3; // every 3rd restaurant: a sample, like the reference

interface AddressCardProps {
  data: StoryData["site.json"];
  zips: StoryData["zips.json"] | null;
  points: StoryData["points.json"] | null;
}

const near = (c: LngLat, [lng, lat]: LngLat) => Math.hypot((lng - c[0]) * 52.4, (lat - c[1]) * 69) <= DOT_MILES;

export function AddressCard({ data, zips, points }: AddressCardProps) {
  const [street, ...rest] = data.address.split(", ");
  const lot = data.lot;
  const center = useMemo<LngLat>(() => [data.lon, data.lat], [data.lon, data.lat]);
  const dots = useMemo(
    () =>
      points
        ? {
            restaurants: (points.restaurants as LngLat[]).filter((p, i) => i % RESTAURANT_SAMPLE === 0 && near(center, p)),
            cultural: (points.cultural_orgs as LngLat[]).filter((p) => near(center, p)),
          }
        : undefined,
    [points, center],
  );
  return (
    <div className="map-card">
      <div>
        <p className="address-block">{street.toUpperCase()}</p>
        <p className="card-sub">{rest.join(", ")}</p>
      </div>
      {zips && (
        <ZipMap zips={zips.zips} highlight={zips.highlight} center={center} radiusMiles={VIEW_MILES} pin={center} dots={dots}
          title={`Map: ZIP ${zips.highlight} outlined, pin at ${data.address}, with nearby restaurants and cultural organizations`} />
      )}
      <div>
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
