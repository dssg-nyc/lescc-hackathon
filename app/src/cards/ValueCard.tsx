import { RankBars } from "../components/RankBars";
import type { StoryData } from "../data/schema";
import { fmtInt, fmtUsd } from "./format";

const growth = (a: number | null, b: number | null) => (a && b ? `${(b / a).toFixed(1)}×` : "—");

export function ValueCard({ data }: { data: StoryData["value.json"] }) {
  const first = data.jobs_trend[0];
  const last = data.jobs_trend[data.jobs_trend.length - 1];
  const fs = data.food_supply;
  const range = (r: StoryData["value.json"]["food_truck_revenue"]) =>
    r ? `${fmtUsd(r.low)}–${fmtUsd(r.high)}` : "Awaiting data";
  return (
    <div className="value-grid">
      <section aria-labelledby="v-jobs">
        <h2 id="v-jobs" className="card-h3">Jobs within 0.5 mi, {last.year}</h2>
        <RankBars label="Jobs by sector" rows={[
          { label: "Food service jobs", value: last.food ?? 0, display: fmtInt(last.food), tone: "baseline" },
          { label: "Arts and recreation jobs", value: last.arts ?? 0, display: fmtInt(last.arts), tone: "proposal" },
        ]} />
        <p className="card-meta">Since {first.year}: food service {growth(first.food, last.food)}, arts {growth(first.arts, last.arts)}.</p>
      </section>
      <section aria-labelledby="v-supply">
        <h2 id="v-supply" className="card-h3">Food supply</h2>
        <p className="card-sub">{fmtInt(fs.restaurants["0.5"])} restaurants within half a mile. {fmtInt(fs.cultural_orgs["0.5"])} cultural organizations.</p>
      </section>
      <section aria-labelledby="v-rev">
        <h2 id="v-rev" className="card-h3">Revenue</h2>
        <dl className="value-rev">
          <div data-tone="baseline"><dt>Food trucks</dt><dd>{range(data.food_truck_revenue)}</dd></div>
          <div data-tone="proposal"><dt>Arts center</dt><dd>{range(data.arts_center_revenue)}</dd></div>
        </dl>
        <p className="card-meta">
          Parks café and parkhouse concessions gross {data.concession_comparables.map((c) => fmtUsd(c.gross)).join(" and ")} a year (not food truck figures).
          {" "}Applicant model, unverified: coffee concession {fmtUsd(data.proposal.coffee_concession_per_day)} a day.
        </p>
      </section>
    </div>
  );
}
