import { render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CountUp } from "./CountUp";

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: reduce,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

describe("CountUp", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  });
  afterEach(() => vi.useRealTimers());

  it("shows 'awaiting data' for a null value, never a number", () => {
    mockReducedMotion(false);
    render(<CountUp value={null} />);
    expect(screen.getByText(/awaiting data/i)).toBeInTheDocument();
  });

  it("exposes the final formatted value to screen readers at once", () => {
    mockReducedMotion(false);
    render(<CountUp value={14957} />);
    expect(screen.getByTestId("countup-final")).toHaveTextContent("14,957");
  });

  it("shows the final digits immediately under reduced motion", () => {
    mockReducedMotion(true);
    render(<CountUp value={2024} />);
    expect(screen.getByTestId("countup-visual")).toHaveAttribute("data-value", "2,024");
  });

  it("reaches the final value after the duration", () => {
    mockReducedMotion(false);
    render(<CountUp value={500} durationMs={1500} />);
    expect(screen.getByTestId("countup-visual")).not.toHaveAttribute("data-value", "500");
    act(() => vi.advanceTimersByTime(1600));
    expect(screen.getByTestId("countup-visual")).toHaveAttribute("data-value", "500");
  });
});
