import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Caveat } from "./Caveat";
import { SourceSheet } from "./SourceSheet";

describe("Caveat", () => {
  it("shows the caveat text and opens sources", () => {
    const onSources = vi.fn();
    render(<Caveat text="Not a like-for-like comparison." onSources={onSources} />);
    expect(screen.getByText(/like-for-like/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sources" }));
    expect(onSources).toHaveBeenCalled();
  });
});

describe("SourceSheet", () => {
  it("names the data file, or says the card is text only", () => {
    const { rerender } = render(
      <SourceSheet open title="VALUE" caveat="c" dataFile="value.json" onClose={vi.fn()} />,
    );
    expect(screen.getByText("Data file: value.json", { selector: "p" })).toBeInTheDocument();
    rerender(<SourceSheet open title="INTRO" caveat="c" dataFile={null} onClose={vi.fn()} />);
    expect(screen.getByText(/text only/i)).toBeInTheDocument();
  });

  it("close button calls onClose", () => {
    const onClose = vi.fn();
    render(<SourceSheet open title="X" caveat="c" dataFile={null} onClose={onClose} />);
    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalled();
  });
});
