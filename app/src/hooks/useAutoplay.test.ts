import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutoplay } from "./useAutoplay";

describe("useAutoplay", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("advances after motion + hold when enabled", () => {
    const onAdvance = vi.fn();
    renderHook(() => useAutoplay({ enabled: true, delayMs: 5900, cardKey: "a", onAdvance }));
    vi.advanceTimersByTime(5899);
    expect(onAdvance).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  it("does nothing when disabled", () => {
    const onAdvance = vi.fn();
    renderHook(() => useAutoplay({ enabled: false, delayMs: 100, cardKey: "a", onAdvance }));
    vi.advanceTimersByTime(1000);
    expect(onAdvance).not.toHaveBeenCalled();
  });

  it("restarts the timer when the card changes", () => {
    const onAdvance = vi.fn();
    const { rerender } = renderHook(
      ({ cardKey }) => useAutoplay({ enabled: true, delayMs: 1000, cardKey, onAdvance }),
      { initialProps: { cardKey: "a" } },
    );
    vi.advanceTimersByTime(800);
    rerender({ cardKey: "b" });
    vi.advanceTimersByTime(800);
    expect(onAdvance).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });

  it("pauses while the tab is hidden", () => {
    const onAdvance = vi.fn();
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    renderHook(() => useAutoplay({ enabled: true, delayMs: 100, cardKey: "a", onAdvance }));
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    vi.advanceTimersByTime(500);
    expect(onAdvance).not.toHaveBeenCalled();
    hidden.mockReturnValue(false);
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    vi.advanceTimersByTime(100);
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });
});
