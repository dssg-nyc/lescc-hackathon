import { RankBars } from "../components/RankBars";
import type { StoryData } from "../data/schema";
import { fmtInt, fmtPct, fmtUsd } from "./format";

export function ResidentsCard({ data }: { data: StoryData["acs.json"] }) {
  const [top] = data.groups;
  return (
    <>
      <p className="card-eyebrow">Largest group in {data.geography}</p>
      <h2 className="card-h2">{top.label}</h2>
      <p className="card-sub">{fmtPct(top.share)} of {fmtInt(data.population)} residents.</p>
      <RankBars label="Residents by race and Hispanic origin"
        rows={data.groups.map((g) => ({ label: g.label, value: g.share, display: fmtPct(g.share) }))} />
      <p className="card-meta">Median household income {fmtUsd(data.median_household_income)}. {data.release}.</p>
    </>
  );
}
