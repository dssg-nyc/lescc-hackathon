import { CountUp } from "../components/CountUp";
import { RankBars, type RankRow } from "../components/RankBars";
import type { Votes } from "../data/schema";
import { VOTE_OPTIONS, type VoteChoice } from "../hooks/useVote";
import { fmtPct } from "./format";

export function ResultsCard({ vote, tally }: { vote: VoteChoice | null; tally: Votes | null }) {
  if (!vote) return <p className="card-sub">Vote on the previous card to see results.</p>;
  const mine = VOTE_OPTIONS.find((o) => o.id === vote)?.label;
  const total = tally ? tally.food_truck + tally.cultural_center : 0;
  const rows: RankRow[] = tally
    ? [
        { label: "Cultural center", value: tally.cultural_center, display: fmtPct(tally.cultural_center / total), tone: "proposal" as const },
        { label: "Food trucks", value: tally.food_truck, display: fmtPct(tally.food_truck / total), tone: "baseline" as const },
      ].sort((a, b) => b.value - a.value)
    : [];
  return (
    <>
      <p className="card-sub">You voted: <strong>{mine}</strong></p>
      {tally && total > 0 ? (
        <>
          <p className="card-number"><CountUp value={total} /></p>
          <p className="card-meta">votes so far</p>
          <RankBars label="Votes" rows={rows} />
        </>
      ) : (
        <p className="card-meta">Results unavailable until the vote service is live.</p>
      )}
    </>
  );
}
