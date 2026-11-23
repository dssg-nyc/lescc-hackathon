import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { binFor } from "../lib/choropleth";
import { ZipMap, type ZipShape } from "./ZipMap";

const sq = (x: number, y: number, d = 0.01): number[][][][] => [[[[x, y], [x + d, y], [x + d, y + d], [x, y + d], [x, y]]]];
const ZIPS: ZipShape[] = [
  { zip: "10002", polygons: sq(-73.99, 40.71), ratio: 10.4 },
  { zip: "10003", polygons: sq(-73.98, 40.72), ratio: 30 },
  { zip: "10004", polygons: sq(-74.01, 40.70), ratio: null },
];
const CENTER: [number, number] = [-73.99, 40.715];

describe("ZipMap", () => {
  it("draws one path per ZIP and marks the highlighted ZIP", () => {
    render(<ZipMap zips={ZIPS} highlight="10002" center={CENTER} radiusMiles={2} title="Map of ZIP 10002" />);
    expect(screen.getByRole("img", { name: "Map of ZIP 10002" })).toBeInTheDocument();
    expect(document.querySelectorAll("path.zip")).toHaveLength(3);
    expect(document.querySelector('path.zip[data-zip="10002"]')).toHaveClass("zip-highlight");
  });

  it("outline mode adds a pin and dots", () => {
    render(<ZipMap zips={ZIPS} highlight="10002" center={CENTER} radiusMiles={1} title="t" pin={CENTER}
      dots={{ restaurants: [[-73.991, 40.715]], cultural: [[-73.989, 40.716]] }} />);
    expect(document.querySelector(".zip-pin")).not.toBeNull();
    expect(document.querySelectorAll("circle.dot-rest")).toHaveLength(1);
    expect(document.querySelectorAll("circle.dot-cult")).toHaveLength(1);
  });

  it("choropleth mode fills by bin, leaves no-data ZIPs unfilled, and shows a legend", () => {
    render(<ZipMap zips={ZIPS} highlight="10002" center={CENTER} radiusMiles={3} title="t" mode="choropleth"
      rings={[0.5, 1, 2]} legend="Restaurants per cultural organization" />);
    expect(document.querySelector('path.zip[data-zip="10004"]')).toHaveAttribute("data-bin", "none");
    expect(document.querySelector('path.zip[data-zip="10003"]')?.getAttribute("data-bin")).not.toBe("none");
    expect(document.querySelectorAll("circle.zip-ring")).toHaveLength(3);
    expect(screen.getByText("Restaurants per cultural organization")).toBeInTheDocument();
  });
});

describe("binFor", () => {
  it("assigns quantile bins and null for missing values", () => {
    const breaks = [5, 10, 20];
    expect(binFor(1, breaks)).toBe(0);
    expect(binFor(10.4, breaks)).toBe(2);
    expect(binFor(99, breaks)).toBe(3);
    expect(binFor(null, breaks)).toBeNull();
  });
});
