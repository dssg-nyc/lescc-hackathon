import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useVote, VOTE_KEY } from "./useVote";

describe("useVote", () => {
  afterEach(() => localStorage.clear());

  it("starts with no vote", () => {
    const { result } = renderHook(() => useVote());
    expect(result.current.vote).toBeNull();
  });

  it("records one vote and persists it", () => {
    const { result } = renderHook(() => useVote());
    act(() => result.current.cast("cultural_center"));
    expect(result.current.vote).toBe("cultural_center");
    expect(localStorage.getItem(VOTE_KEY)).toBe("cultural_center");
  });

  it("ignores a second vote", () => {
    const { result } = renderHook(() => useVote());
    act(() => result.current.cast("food_truck"));
    act(() => result.current.cast("cultural_center"));
    expect(result.current.vote).toBe("food_truck");
  });

  it("ignores stored garbage", () => {
    localStorage.setItem(VOTE_KEY, "<script>");
    const { result } = renderHook(() => useVote());
    expect(result.current.vote).toBeNull();
  });
});
