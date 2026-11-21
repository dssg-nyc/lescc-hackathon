import { useCallback, useEffect, useState } from "react";

interface HashCard {
  readonly id: string;
  readonly label: string;
}

const TITLE_PREFIX = "LESCC · ";

/**
 * Keeps the active card in sync with the URL hash (#intro, #crowd, ...)
 * and sets document.title per card. Unknown or empty hashes fall back to card 0.
 */
export function useCardHash(cards: readonly HashCard[]): [number, (next: number) => void] {
  const readIndex = useCallback((): number => {
    const id = window.location.hash.replace("#", "");
    const found = cards.findIndex((card) => card.id === id);
    return found === -1 ? 0 : found;
  }, [cards]);

  const [index, setIndex] = useState<number>(readIndex);

  useEffect(() => {
    const onHashChange = () => setIndex(readIndex());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [readIndex]);

  useEffect(() => {
    const card = cards[index];
    if (card) document.title = `${TITLE_PREFIX}${card.label}`;
  }, [cards, index]);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), cards.length - 1);
      const target = `#${cards[clamped].id}`;
      if (window.location.hash !== target) window.location.hash = target;
      setIndex(clamped);
    },
    [cards],
  );

  return [index, go];
}
