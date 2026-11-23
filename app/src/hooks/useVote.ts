import { useCallback, useState } from "react";

export type VoteChoice = "food_truck" | "cultural_center";
export const VOTE_KEY = "lescc-vote";
const CHOICES: readonly VoteChoice[] = ["food_truck", "cultural_center"];

export const VOTE_OPTIONS: readonly { id: VoteChoice; label: string }[] = [
  { id: "food_truck", label: "Food trucks" },
  { id: "cultural_center", label: "Cultural center" },
];

function read(): VoteChoice | null {
  try {
    const v = localStorage.getItem(VOTE_KEY);
    return CHOICES.includes(v as VoteChoice) ? (v as VoteChoice) : null;
  } catch {
    return null;
  }
}

/** One vote per browser. The server enforces its own limit (Phase 4b). */
export function useVote() {
  const [vote, setVote] = useState<VoteChoice | null>(read);

  const cast = useCallback((choice: VoteChoice) => {
    setVote((prev) => {
      if (prev) return prev;
      try {
        localStorage.setItem(VOTE_KEY, choice);
      } catch {
        // storage blocked: the vote still counts for this visit
      }
      return choice;
    });
  }, []);

  return { vote, cast };
}
