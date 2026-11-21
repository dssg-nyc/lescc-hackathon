import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SCHEMAS, VotesSchema, type DataFile } from "./schema";

const load = (name: string) =>
  JSON.parse(readFileSync(resolve(__dirname, "../../public/data", name), "utf8")) as unknown;

describe("data contract", () => {
  it.each(Object.keys(SCHEMAS) as DataFile[])("public/data/%s matches its schema", (name) => {
    const result = SCHEMAS[name].safeParse(load(name));
    expect(result.success, JSON.stringify(result.error?.issues?.slice(0, 3))).toBe(true);
  });

  it("every file names at least one source and a caveat", () => {
    for (const name of Object.keys(SCHEMAS) as DataFile[]) {
      const doc = load(name) as { sources: unknown[]; caveat: string };
      expect(doc.sources.length).toBeGreaterThan(0);
      expect(doc.caveat.length).toBeGreaterThan(0);
    }
  });

  it("rejects a file that drops its sources", () => {
    const doc = { ...(load("foot.json") as object), sources: undefined };
    expect(SCHEMAS["foot.json"].safeParse(doc).success).toBe(false);
  });

  it("allows null numbers (awaiting data) but not strings", () => {
    const doc = load("value.json") as Record<string, unknown>;
    expect(SCHEMAS["value.json"].safeParse({ ...doc, food_truck_revenue: null }).success).toBe(true);
    expect(SCHEMAS["value.json"].safeParse({ ...doc, food_truck_revenue: "$40k" }).success).toBe(false);
  });

  it("vote tallies must be non-negative integers", () => {
    expect(VotesSchema.safeParse({ food_truck: 3, cultural_center: 7 }).success).toBe(true);
    expect(VotesSchema.safeParse({ food_truck: -1, cultural_center: 7 }).success).toBe(false);
    expect(VotesSchema.safeParse({ food_truck: 1.5, cultural_center: 7 }).success).toBe(false);
  });
});
