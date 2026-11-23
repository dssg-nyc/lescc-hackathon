import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RankBars } from "./RankBars";

describe("RankBars", () => {
  it("lists rows in the order given with rank, label, and value text", () => {
    render(
      <RankBars
        label="Residents by group"
        rows={[
          { label: "Asian", value: 0.362, display: "36%" },
          { label: "White", value: 0.271, display: "27%" },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("1Asian36%");
    expect(items[1]).toHaveTextContent("2White27%");
  });

  it("scales bars relative to the largest value", () => {
    render(<RankBars label="x" rows={[{ label: "A", value: 10, display: "10" }, { label: "B", value: 5, display: "5" }]} />);
    const bars = document.querySelectorAll<HTMLElement>(".rank-bar-fill");
    expect(bars[0].style.getPropertyValue("--scale")).toBe("1");
    expect(bars[1].style.getPropertyValue("--scale")).toBe("0.5");
  });

  it("can tint a row with a semantic tone", () => {
    render(<RankBars label="x" rows={[{ label: "A", value: 1, display: "1", tone: "proposal" }]} />);
    expect(screen.getByRole("listitem")).toHaveAttribute("data-tone", "proposal");
  });
});
