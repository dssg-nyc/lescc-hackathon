import { useEffect, useState } from "react";
import { loadStoryData, type LoadedStory } from "./loadStoryData";

/** null while loading ("Preparing the cards"), then per-file results. */
export function useStoryData(): LoadedStory | null {
  const [data, setData] = useState<LoadedStory | null>(null);

  useEffect(() => {
    let alive = true;
    loadStoryData().then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  return data;
}
