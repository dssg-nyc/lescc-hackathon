import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StoryShell } from "./StoryShell";

const CARDS = [
  { id: "intro", label: "INTRO" },
  { id: "crowd", label: "FOOT TRAFFIC" },
  { id: "quiz", label: "GUESS" },
];

function setup(index: number) {
  const props = {
    cards: CARDS,
    index,
    go: vi.fn(),
    playing: true,
    onTogglePlay: vi.fn(),
    onInfo: vi.fn(),
    onClose: vi.fn(),
  };
  render(
    <StoryShell {...props}>
      <h1>Card body</h1>
    </StoryShell>,
  );
  return props;
}

describe("StoryShell", () => {
  it("renders one progress segment per card and marks the current one", () => {
    setup(1);
    const segments = screen.getAllByRole("button", { name: /^go to card/i });
    expect(segments).toHaveLength(3);
    expect(segments[1]).toHaveAttribute("aria-current", "step");
  });

  it("shows the current card label in the header", () => {
    setup(1);
    expect(screen.getByText("FOOT TRAFFIC")).toBeInTheDocument();
  });

  it("jumps when a segment is clicked", () => {
    const props = setup(0);
    fireEvent.click(screen.getByRole("button", { name: /go to card 3/i }));
    expect(props.go).toHaveBeenCalledWith(2);
  });

  it("arrow keys move next and previous", () => {
    const props = setup(1);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(props.go).toHaveBeenNthCalledWith(1, 2);
    expect(props.go).toHaveBeenNthCalledWith(2, 0);
  });

  it("disables previous on the first card and next on the last", () => {
    setup(0);
    expect(screen.getByRole("button", { name: /previous card/i })).toBeDisabled();
    screen.getByRole("button", { name: /next card/i }).click();
  });

  it("disables next on the last card", () => {
    setup(2);
    expect(screen.getByRole("button", { name: /next card/i })).toBeDisabled();
  });

  it("header buttons call their handlers", () => {
    const props = setup(1);
    fireEvent.click(screen.getByRole("button", { name: /sources/i }));
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    fireEvent.click(screen.getByRole("button", { name: /close story/i }));
    expect(props.onInfo).toHaveBeenCalled();
    expect(props.onTogglePlay).toHaveBeenCalled();
    expect(props.onClose).toHaveBeenCalled();
  });

  it("swipe left advances", () => {
    const props = setup(1);
    const region = screen.getByTestId("story-card-region");
    fireEvent.pointerDown(region, { clientX: 200, clientY: 100 });
    fireEvent.pointerUp(region, { clientX: 100, clientY: 105 });
    expect(props.go).toHaveBeenCalledWith(2);
  });
});
