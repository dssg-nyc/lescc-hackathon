import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RingMap } from "./RingMap";

describe("RingMap", () => {
  it("draws one labelled circle per ring and a site pin, with a text alternative", () => {
    render(<RingMap rings={[0.5, 1, 2]} title="Rings around 76 Delancey St" />);
    expect(screen.getByRole("img", { name: "Rings around 76 Delancey St" })).toBeInTheDocument();
    expect(document.querySelectorAll("circle.ring")).toHaveLength(3);
    expect(screen.getByText("0.5 mi")).toBeInTheDocument();
    expect(document.querySelector(".ring-pin")).not.toBeNull();
  });

  it("can show only the inner ring (address zoom)", () => {
    render(<RingMap rings={[0.5]} title="Site" />);
    expect(document.querySelectorAll("circle.ring")).toHaveLength(1);
  });
});
