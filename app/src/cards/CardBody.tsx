import type { DataFile, StoryData } from "../data/schema";
import { AddressCard } from "./AddressCard";
import { CrowdCard } from "./CrowdCard";
import { DemographicsCard } from "./DemographicsCard";
import { HistoryCard } from "./HistoryCard";
import { IntroCard } from "./IntroCard";
import { QuizCard } from "./QuizCard";
import { ResidentsCard } from "./ResidentsCard";
import { ResultsCard } from "./ResultsCard";
import { SummaryCard } from "./SummaryCard";
import type { CardProps } from "./types";
import { Unavailable } from "./Unavailable";
import { ValueCard } from "./ValueCard";
import "./cards.css";

/** Picks the body for a card. Data cards render Unavailable if their file failed. */
export function CardBody(props: CardProps) {
  const { card, story } = props;
  const file = card.dataFile as DataFile | null;
  const loaded = file ? story[file] : null;
  if (loaded && !loaded.ok) return <Unavailable error={loaded.error} />;

  // Safe: the card's own file was checked above. Throws only on a config/file mismatch.
  const get = <K extends DataFile>(name: K): StoryData[K] => {
    const entry = story[name];
    if (!entry.ok) throw new Error(`${card.id} expects ${name}`);
    return entry.data;
  };

  const opt = <K extends DataFile>(name: K): StoryData[K] | null => {
    const entry = story[name];
    return entry.ok ? entry.data : null;
  };
  const site = opt("site.json");

  switch (card.id) {
    case "intro": return <IntroCard onStart={props.onStart} />;
    case "crowd": return <CrowdCard data={get("foot.json")} />;
    case "quiz": return <QuizCard data={get("quiz.json")} onAnswered={props.onAnswered} />;
    case "residents": return <ResidentsCard data={get("acs.json")} />;
    case "address": return <AddressCard data={get("site.json")} zips={opt("zips.json")} points={opt("points.json")} />;
    case "history": return <HistoryCard />;
    case "demographics": return <DemographicsCard data={get("rings.json")} zips={opt("zips.json")} center={site ? [site.lon, site.lat] : [-73.990207, 40.719552]} />;
    case "value": return <ValueCard data={get("value.json")} />;
    case "summary": return <SummaryCard story={story} vote={props.vote} onVote={props.onVote} />;
    case "results": return <ResultsCard vote={props.vote} tally={props.tally} />;
  }
}
