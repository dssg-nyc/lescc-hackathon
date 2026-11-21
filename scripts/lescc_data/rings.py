"""Assign Census 2020 blocks to cumulative rings around the site."""

from __future__ import annotations

import pandas as pd

from .geo import RINGS_MI


def tract_weights(blocks: pd.DataFrame) -> dict[tuple[float, str], float]:
    """Share of each tract's blocks inside each cumulative ring.

    blocks needs columns: tabblk2020, trct, miles. A stand-in for area weighting:
    blocks are small and dense in Manhattan, so block share tracks area share closely.
    """
    total = blocks.groupby("trct")["tabblk2020"].count()
    weights: dict[tuple[float, str], float] = {}
    for ring in RINGS_MI:
        inside = blocks[blocks["miles"] <= ring].groupby("trct")["tabblk2020"].count()
        for trct, n in inside.items():
            weights[(ring, trct)] = round(n / total[trct], 4)
    return weights


def ring_totals(blocks: pd.DataFrame, by_block: pd.DataFrame, cols: list[str]) -> dict[float, dict[str, int]]:
    """Sum block-level values (LODES w_geocode rows) inside each cumulative ring."""
    merged = by_block.merge(blocks[["tabblk2020", "miles"]], left_on="w_geocode", right_on="tabblk2020")
    return {
        ring: {c: int(merged.loc[merged["miles"] <= ring, c].sum()) for c in cols}
        for ring in RINGS_MI
    }
