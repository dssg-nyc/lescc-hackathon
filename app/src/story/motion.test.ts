import { describe, expect, it } from "vitest";
import { autoplayDelay } from "./motion";

describe("autoplayDelay", () => {
  it("holds 5 s after the card change on text cards", () => {
    expect(autoplayDelay(false)).toBe(5900);
  });
  it("adds the count-up window on data cards", () => {
    expect(autoplayDelay(true)).toBe(7400);
  });
});
