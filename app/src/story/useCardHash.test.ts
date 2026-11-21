import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCardHash } from "./useCardHash";

const CARDS = [
  { id: "intro", label: "INTRO" },
  { id: "crowd", label: "FOOT TRAFFIC" },
  { id: "quiz", label: "GUESS" },
] as const;

describe("useCardHash", () => {
  it("falls back to the first card when the hash is empty or unknown", () => {
    window.location.hash = "#nope";
    const { result } = renderHook(() => useCardHash(CARDS));
    expect(result.current[0]).toBe(0);
  });

  it("reads the starting card from the hash", () => {
    window.location.hash = "#quiz";
    const { result } = renderHook(() => useCardHash(CARDS));
    expect(result.current[0]).toBe(2);
  });

  it("go() updates the hash and clamps to the card range", () => {
    const { result } = renderHook(() => useCardHash(CARDS));
    act(() => result.current[1](1));
    expect(window.location.hash).toBe("#crowd");
    act(() => result.current[1](99));
    expect(result.current[0]).toBe(2);
    act(() => result.current[1](-5));
    expect(result.current[0]).toBe(0);
  });

  it("follows browser hash changes (back button)", () => {
    const { result } = renderHook(() => useCardHash(CARDS));
    act(() => {
      window.location.hash = "#quiz";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current[0]).toBe(2);
  });

  it("sets the page title per card", () => {
    window.location.hash = "#crowd";
    renderHook(() => useCardHash(CARDS));
    expect(document.title).toBe("LESCC · FOOT TRAFFIC");
  });
});
