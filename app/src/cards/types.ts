import type { LoadedStory } from "../data/loadStoryData";
import type { Votes } from "../data/schema";
import type { VoteChoice } from "../hooks/useVote";
import type { Card } from "../story/config";

export interface CardProps {
  card: Card;
  story: LoadedStory;
  vote: VoteChoice | null;
  tally: Votes | null;
  onVote: (choice: VoteChoice) => void;
  onAnswered: () => void;
  onStart: () => void;
}
