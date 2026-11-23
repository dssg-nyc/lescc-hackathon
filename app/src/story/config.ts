// Story config: nine cards, one hash route each (see docs/story-cards-plan.md).
// Every number on screen must come from public/data/*.json with a source.
// Null values render as "awaiting data". Do not invent them.

export type CardId =
  | "intro"
  | "crowd"
  | "quiz"
  | "residents"
  | "address"
  | "demographics"
  | "value"
  | "summary"
  | "results";

/** Card background. Proposal is green; baseline is grey. Red is never a tone. */
export type CardTone = "light" | "dark" | "green";

export interface Card {
  id: CardId;
  label: string; // header label and page title
  headline: string;
  caveat: string;
  tone: CardTone;
  dataFile: string | null; // file under public/data/
  waitsForInput?: boolean; // autoplay holds until the user answers
}

export const SITE = {
  name: "Lower East Side Cultural Center",
  address: "76 Delancey St, New York, NY 10002",
  ringsMiles: [0.5, 1, 2],
} as const;

export const CARDS: readonly Card[] = [
  {
    id: "intro",
    label: "INTRO",
    headline: "Two futures for one corner.",
    caveat: "A story built from public data. Sources in the info sheet.",
    tone: "dark",
    dataFile: null,
  },
  {
    id: "crowd",
    label: "FOOT TRAFFIC",
    headline: "People counted passing the corner.",
    caveat: "Foot traffic source not yet chosen. Shown as awaiting data.",
    tone: "light",
    dataFile: "foot.json",
  },
  {
    id: "quiz",
    label: "GUESS",
    headline: "Which is more common in 10002: restaurants or art and cultural centers?",
    caveat: "Counts need a citywide source. Parks concessions alone cannot answer this.",
    tone: "green",
    dataFile: "quiz.json",
    waitsForInput: true,
  },
  {
    id: "residents",
    label: "YOUR MIX",
    headline: "Who lives in 10002.",
    caveat: "ACS 5-year estimates carry margins of error.",
    tone: "light",
    dataFile: "acs.json",
  },
  {
    id: "address",
    label: "HOTSPOT",
    headline: "The address.",
    caveat: "History points stay 'to research' until each has a source.",
    tone: "light",
    dataFile: "site.json",
  },
  {
    id: "demographics",
    label: "RINGS",
    headline: "Who lives within half a mile, one mile, and two miles.",
    caveat: "Tracts crossing a ring are area-weighted. Projection is a trend range, not a forecast.",
    tone: "light",
    dataFile: "rings.json",
  },
  {
    id: "value",
    label: "VALUE",
    headline: "Arts center vs food trucks.",
    caveat: "Not a like-for-like comparison. Parks café figures are concession comparables, not food truck benchmarks.",
    tone: "green",
    dataFile: "value.json",
  },
  {
    id: "summary",
    label: "WRAPPED",
    headline: "Your call: what belongs on this corner?",
    caveat: "One vote per browser. Votes are anonymous.",
    tone: "dark",
    dataFile: null,
    waitsForInput: true,
  },
  {
    id: "results",
    label: "RESULTS",
    headline: "How visitors voted.",
    caveat: "Self-selected visitors. Not a survey or a poll of residents.",
    tone: "light",
    dataFile: null,
  },
];
