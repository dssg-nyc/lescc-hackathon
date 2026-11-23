import { GuessTiles } from "../components/GuessTiles";
import type { LoadedStory } from "../data/loadStoryData";
import { VOTE_OPTIONS, type VoteChoice } from "../hooks/useVote";
import { fmtInt, fmtPct } from "./format";

function recap(story: LoadedStory): string[] {
  const lines: string[] = [];
  const foot = story["foot.json"];
  if (foot.ok) lines.push(`${fmtInt(foot.data.latest.total)} people counted at the corner in one day's count periods.`);
  const quiz = story["quiz.json"];
  if (quiz.ok && quiz.data.ratio) lines.push(`About ${quiz.data.ratio} restaurants for every cultural organization in 10002.`);
  const acs = story["acs.json"];
  if (acs.ok) lines.push(`${acs.data.groups[0].label} residents are the largest group (${fmtPct(acs.data.groups[0].share)}).`);
  const rings = story["rings.json"];
  if (rings.ok) lines.push(`${fmtInt(rings.data.rings[0].population)} people live within half a mile.`);
  return lines;
}

export function SummaryCard({ story, vote, onVote }: { story: LoadedStory; vote: VoteChoice | null; onVote: (c: VoteChoice) => void }) {
  return (
    <>
      <ul className="recap">{recap(story).map((l) => <li key={l}>{l}</li>)}</ul>
      <GuessTiles legend="Your vote" options={VOTE_OPTIONS} chosen={vote} onChoose={(id) => onVote(id as VoteChoice)} />
      {vote && <p className="card-meta" aria-live="polite">Vote saved. Results are next.</p>}
    </>
  );
}
