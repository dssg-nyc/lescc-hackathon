import { describe, expect, it } from "vitest";
import { circlePolygon, ringBounds } from "./geo";

const SITE: [number, number] = [-73.990207, 40.719552];
const MI_PER_DEG_LAT = 69.0;

describe("circlePolygon", () => {
  it("returns a closed ring of steps + 1 points", () => {
    const ring = circlePolygon(SITE, 0.5, 32);
    expect(ring).toHaveLength(33);
    expect(ring[0]).toEqual(ring[32]);
  });

  it("puts the north point about the right distance away", () => {
    const north = circlePolygon(SITE, 1, 4)[0];
    expect(north[0]).toBeCloseTo(SITE[0], 6);
    expect((north[1] - SITE[1]) * MI_PER_DEG_LAT).toBeCloseTo(1, 1);
  });

  it("widens longitude for latitude (east point farther in degrees than north)", () => {
    const [north, east] = circlePolygon(SITE, 1, 4);
    expect(east[0] - SITE[0]).toBeGreaterThan(north[1] - SITE[1]);
  });
});

describe("ringBounds", () => {
  it("returns [[west, south], [east, north]] around the site", () => {
    const [[w, s], [e, n]] = ringBounds(SITE, 0.5);
    expect(w).toBeLessThan(SITE[0]);
    expect(e).toBeGreaterThan(SITE[0]);
    expect(s).toBeLessThan(SITE[1]);
    expect(n).toBeGreaterThan(SITE[1]);
  });
});
