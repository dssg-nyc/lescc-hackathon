import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrendChart } from "./TrendChart";

const main = { label: "CD3", points: [{ year: 2013, value: 40000 }, { year: 2024, value: 60000 }] };
const ref = { label: "Manhattan", points: [{ year: 2013, value: 70000 }, { year: 2024, value: 104000 }] };

describe("TrendChart", () => {
  it("draws the main and reference lines with a text alternative", () => {
    render(<TrendChart title="Income trend" main={main} reference={ref} />);
    expect(screen.getByRole("img", { name: "Income trend" })).toBeInTheDocument();
    expect(document.querySelector(".trend-main")).not.toBeNull();
    expect(document.querySelector(".trend-ref")).not.toBeNull();
  });

  it("adds a dashed projection band when given a range", () => {
    render(<TrendChart title="t" main={main} projection={{ year: 2029, low: 65000, high: 75000 }} />);
    expect(document.querySelector(".trend-band")).not.toBeNull();
    expect(screen.getByText("2029")).toBeInTheDocument();
  });
});
