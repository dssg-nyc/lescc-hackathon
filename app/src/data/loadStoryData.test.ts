import { afterEach, describe, expect, it, vi } from "vitest";
import { loadStoryData } from "./loadStoryData";

const okFoot = {
  generated: "2026-11-21", status: "ok", caveat: "c",
  sources: [{ name: "DOT", url: null, pulled: "2026-11-21" }],
  station: { loc: 40, street: "Delancey Street", from: "Orchard Street", to: "Ludlow Street", miles_from_site: 0.06 },
  latest: { period: "Sep 2026", year: 2026, am: 1, md: 2, pm: 3, total: 6 },
  series: [{ period: "Sep 2026", year: 2026, am: 1, md: 2, pm: 3, total: 6 }],
};

function mockFetch(handler: (url: string) => Response | Promise<Response>) {
  vi.stubGlobal("fetch", vi.fn((url: string) => Promise.resolve(handler(url))));
}

describe("loadStoryData", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("fetches every file in parallel from /data/", async () => {
    mockFetch(() => new Response("{}", { status: 404 }));
    await loadStoryData();
    const urls = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(urls).toContain("/data/foot.json");
    expect(urls).toHaveLength(8);
  });

  it("returns parsed data for valid files", async () => {
    mockFetch((url) => (url.endsWith("foot.json") ? Response.json(okFoot) : new Response("", { status: 404 })));
    const out = await loadStoryData();
    expect(out["foot.json"]).toEqual({ ok: true, data: okFoot });
  });

  it("isolates failures: a bad file errors without affecting others", async () => {
    mockFetch((url) =>
      url.endsWith("foot.json") ? Response.json(okFoot) : Response.json({ wrong: true }),
    );
    const out = await loadStoryData();
    expect(out["foot.json"].ok).toBe(true);
    expect(out["quiz.json"]).toMatchObject({ ok: false, error: expect.stringMatching(/invalid/i) });
  });

  it("reports HTTP and network errors per file", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const out = await loadStoryData();
    expect(out["site.json"]).toEqual({ ok: false, error: "site.json: offline" });
  });
});
