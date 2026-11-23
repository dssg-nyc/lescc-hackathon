import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchTally, submitVote } from "./voteApi";

const URL_ = "https://script.google.com/macros/s/abc/exec";

describe("voteApi", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns null without an endpoint and never calls the network", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    expect(await fetchTally("")).toBeNull();
    expect(await submitVote("", "food_truck")).toBeNull();
    expect(f).not.toHaveBeenCalled();
  });

  it("posts the choice as text/plain JSON (no CORS preflight) and parses the tally", async () => {
    const f = vi.fn(() => Promise.resolve(Response.json({ food_truck: 1, cultural_center: 4 })));
    vi.stubGlobal("fetch", f);
    const tally = await submitVote(URL_, "cultural_center");
    expect(tally).toEqual({ food_truck: 1, cultural_center: 4 });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(URL_);
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "text/plain;charset=utf-8" });
    expect(JSON.parse(String(init.body))).toEqual({ choice: "cultural_center" });
  });

  it("returns null on a bad response shape or a network error", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(Response.json({ error: "bad request" }))));
    expect(await fetchTally(URL_)).toBeNull();
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    expect(await fetchTally(URL_)).toBeNull();
  });

  it("rejects non-https endpoints", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    expect(await fetchTally("http://example.org/exec")).toBeNull();
    expect(f).not.toHaveBeenCalled();
  });
});
