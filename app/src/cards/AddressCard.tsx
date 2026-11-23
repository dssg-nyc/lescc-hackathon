import { RingMap } from "../components/RingMap";
import type { StoryData } from "../data/schema";
import { fmtInt } from "./format";

const LOT_CLASS: Record<string, string> = { Q1: "park building" };

export function AddressCard({ data }: { data: StoryData["site.json"] }) {
  const [street, ...rest] = data.address.split(", ");
  const lot = data.lot;
  return (
    <div className="split">
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
      <RingMap rings={[0.5]} title={`Pin at ${data.address}, with the half-mile ring`} />
    </div>
  );
}
