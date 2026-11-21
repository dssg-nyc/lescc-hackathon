import { useEffect, useRef, useState } from "react";

interface AutoplayOptions {
  enabled: boolean;
  delayMs: number; // card motion + hold
  cardKey: string; // timer restarts when this changes
  onAdvance: () => void;
}

/** Advances the story after delayMs. Pauses while the tab is hidden. */
export function useAutoplay({ enabled, delayMs, cardKey, onAdvance }: AutoplayOptions): void {
  const advanceRef = useRef(onAdvance);
  const [hidden, setHidden] = useState<boolean>(() => document.hidden);

  useEffect(() => {
    advanceRef.current = onAdvance;
  }, [onAdvance]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!enabled || hidden) return;
    const timer = window.setTimeout(() => advanceRef.current(), delayMs);
    return () => window.clearTimeout(timer);
  }, [enabled, hidden, delayMs, cardKey]);
}
