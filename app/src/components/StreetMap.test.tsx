import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StreetMap } from "./StreetMap";

describe("StreetMap", () => {
  it("shows the SVG ring diagram when WebGL is unavailable (jsdom)", () => {
    render(<StreetMap center={[-73.99, 40.72]} rings={[0.5, 1, 2]} title="Rings around the site" />);
    expect(screen.getByRole("img", { name: "Rings around the site" })).toBeInTheDocument();
    expect(document.querySelectorAll("circle.ring")).toHaveLength(3);
  });

  it("lists point counts as a text alternative when dots are given", () => {
    render(
      <StreetMap center={[-73.99, 40.72]} rings={[2]} title="t"
        points={{ restaurants: [[-73.99, 40.72], [-73.98, 40.72]], cultural: [[-73.99, 40.71]] }} />,
    );
    expect(screen.getByText(/2 restaurants and 1 cultural organization/i)).toBeInTheDocument();
  });
});
