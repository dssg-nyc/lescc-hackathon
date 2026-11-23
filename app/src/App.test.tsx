import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

function serveRealData() {
  vi.stubGlobal("fetch", vi.fn((url: string) => {
    const name = url.replace("/data/", "");
    const body = readFileSync(resolve(__dirname, "../public/data", name), "utf8");
    return Promise.resolve(new Response(body, { status: 200 }));
  }));
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  serveRealData();
});
afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("App", () => {
  it("shows the loading state, then the intro card", async () => {
    render(<App />);
    expect(screen.getByRole("status")).toHaveTextContent(/preparing/i);
    expect(await screen.findByRole("heading", { level: 1, name: /two futures/i })).toBeInTheDocument();
  });

  it("Start goes to the foot traffic card with its data caveat", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: /start/i }));
    expect((await screen.findAllByText(/not a full-day total/i)).length).toBeGreaterThan(0);
    expect(window.location.hash).toBe("#crowd");
  });

  it("a results link without a vote returns to the vote card", async () => {
    window.location.hash = "#results";
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1, name: /your call/i })).toBeInTheDocument();
  });

  it("voting unlocks results", async () => {
    window.location.hash = "#summary";
    render(<App />);
    fireEvent.click(await screen.findByRole("radio", { name: /cultural center/i }));
    act(() => {
      fireEvent.keyDown(window, { key: "ArrowRight" });
    });
    expect(await screen.findByText(/you voted/i)).toHaveTextContent(/cultural center/i);
  });

  it("the info button opens the sheet with linked sources", async () => {
    window.location.hash = "#crowd";
    render(<App />);
    await screen.findAllByText(/not a full-day total/i);
    fireEvent.click(screen.getByRole("button", { name: /sources and method/i }));
    expect(screen.getByRole("link", { name: /pedestrian counts/i, hidden: true })).toBeInTheDocument();
  });
});
