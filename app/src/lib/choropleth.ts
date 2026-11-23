// Choropleth binning helpers.

/** Index of the first break above v (0..breaks.length). null for missing data. */
export function binFor(v: number | null, breaks: readonly number[]): number | null {
  if (v === null) return null;
  const i = breaks.findIndex((b) => v < b);
  return i === -1 ? breaks.length : i;
}

export function quantileBreaks(values: number[], bins: number): number[] {
  const s = [...values].sort((a, b) => a - b);
  return Array.from({ length: bins - 1 }, (_, i) => s[Math.floor(((i + 1) / bins) * s.length)]);
}

