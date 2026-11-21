// JS mirror of the motion tokens in styles/tokens.css. Keep in sync.
export const CARD_MS = 900;
export const COUNT_MS = 1500;
export const HOLD_MS = 5000;

/** Autoplay delay: card change, plus count-up on data cards, plus the hold. */
export function autoplayDelay(hasData: boolean): number {
  return CARD_MS + (hasData ? COUNT_MS : 0) + HOLD_MS;
}
