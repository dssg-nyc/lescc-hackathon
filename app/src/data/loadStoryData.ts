import { SCHEMAS, type DataFile, type StoryData } from "./schema";

export type Loaded<T> = { ok: true; data: T } | { ok: false; error: string };
export type LoadedStory = { [K in DataFile]: Loaded<StoryData[K]> };

const BASE = "/data/";

async function loadOne<K extends DataFile>(name: K): Promise<Loaded<StoryData[K]>> {
  try {
    const res = await fetch(`${BASE}${name}`);
    if (!res.ok) return { ok: false, error: `${name}: HTTP ${res.status}` };
    const parsed = SCHEMAS[name].safeParse(await res.json());
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { ok: false, error: `${name}: invalid data at ${issue?.path.join(".") || "root"}` };
    }
    return { ok: true, data: parsed.data as StoryData[K] };
  } catch (err) {
    return { ok: false, error: `${name}: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/** Loads all story data in parallel. One bad file never blocks the others. */
export async function loadStoryData(): Promise<LoadedStory> {
  const names = Object.keys(SCHEMAS) as DataFile[];
  const results = await Promise.all(names.map((n) => loadOne(n)));
  return Object.fromEntries(names.map((n, i) => [n, results[i]])) as LoadedStory;
}
