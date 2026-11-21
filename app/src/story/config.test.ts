import { describe, expect, it } from "vitest";
import { CARDS } from "./config";

describe("story config", () => {
  it("has the nine cards in order", () => {
    expect(CARDS.map((c) => c.id)).toEqual([
      "intro", "crowd", "quiz", "residents", "address",
      "demographics", "value", "summary", "results",
    ]);
  });

  it("gives every card a unique label and a caveat", () => {
    const labels = new Set(CARDS.map((c) => c.label));
    expect(labels.size).toBe(CARDS.length);
    for (const card of CARDS) expect(card.caveat.length).toBeGreaterThan(0);
  });

  it("never uses red as a card tone", () => {
    for (const card of CARDS) expect(["light", "dark", "green"]).toContain(card.tone);
  });
});
