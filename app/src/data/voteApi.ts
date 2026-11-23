// Client for the Google Sheet vote (scripts/google-sheet-vote/Code.gs).
// Every failure returns null: the results card then says "results unavailable".
import type { VoteChoice } from "../hooks/useVote";
import { VotesSchema, type Votes } from "./schema";

export const VOTE_ENDPOINT: string = import.meta.env.VITE_VOTE_ENDPOINT ?? "";

function usable(endpoint: string): boolean {
  return endpoint.startsWith("https://");
}

async function parse(res: Response): Promise<Votes | null> {
  if (!res.ok) return null;
  const parsed = VotesSchema.safeParse(await res.json());
  return parsed.success ? parsed.data : null;
}

export async function fetchTally(endpoint: string = VOTE_ENDPOINT): Promise<Votes | null> {
  if (!usable(endpoint)) return null;
  try {
    return await parse(await fetch(endpoint));
  } catch {
    return null;
  }
}

/** text/plain keeps this a "simple" request, so Apps Script needs no CORS preflight. */
export async function submitVote(endpoint: string, choice: VoteChoice): Promise<Votes | null> {
  if (!usable(endpoint)) return null;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ choice }),
    });
    return await parse(res);
  } catch {
    return null;
  }
}
