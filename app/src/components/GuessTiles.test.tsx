import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GuessTiles } from "./GuessTiles";

const OPTIONS = [
  { id: "a", label: "Restaurants" },
  { id: "b", label: "Art and cultural organizations" },
];

describe("GuessTiles", () => {
  it("renders a labelled radio group with one tile per option", () => {
    render(<GuessTiles legend="Pick one" options={OPTIONS} chosen={null} onChoose={vi.fn()} />);
    expect(screen.getByRole("radiogroup", { name: "Pick one" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("calls onChoose with the option id", () => {
    const onChoose = vi.fn();
    render(<GuessTiles legend="Pick" options={OPTIONS} chosen={null} onChoose={onChoose} />);
    fireEvent.click(screen.getByRole("radio", { name: /restaurants/i }));
    expect(onChoose).toHaveBeenCalledWith("a");
  });

  it("locks after a choice and marks right and wrong when an answer is given", () => {
    const onChoose = vi.fn();
    render(<GuessTiles legend="Pick" options={OPTIONS} chosen="b" answer="a" onChoose={onChoose} />);
    const [a, b] = screen.getAllByRole("radio");
    expect(b).toBeChecked();
    expect(a).toBeDisabled();
    expect(a.closest("label")).toHaveAttribute("data-result", "answer");
    expect(b.closest("label")).toHaveAttribute("data-result", "wrong");
  });
});
