"""NYC DOT Bi-Annual Pedestrian Counts: series for the station nearest the site."""

from __future__ import annotations

import math
import re
from pathlib import Path

import pandas as pd

from .geo import miles_from_site

PERIOD_RE = re.compile(r"^(May|June|Sept|Oct)(\d{2})_(AM|MD|PM)$", re.IGNORECASE)
MONTHS = {"may": (5, "May"), "june": (6, "Jun"), "sept": (9, "Sep"), "oct": (10, "Oct")}


def parse_count(value) -> int | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return None if math.isnan(value) else int(value)
    text = str(value).replace(",", "").strip()
    return int(float(text)) if text else None


def period_label(prefix: str) -> tuple[str, int, int]:
    m = re.match(r"^([A-Za-z]+)(\d{2})$", prefix)
    if not m:
        raise ValueError(f"Unrecognized count period: {prefix}")
    month, short = MONTHS[m.group(1).lower()]
    year = 2000 + int(m.group(2))
    return f"{short} {year}", year, month


def station_series(row: pd.Series) -> list[dict]:
    """Group a station's columns into one record per count period, oldest first."""
    periods: dict[str, dict] = {}
    for col, raw in row.items():
        m = PERIOD_RE.match(str(col))
        if not m:
            continue
        prefix = f"{m.group(1)}{m.group(2)}"
        label, year, month = period_label(prefix)
        rec = periods.setdefault(prefix, {"period": label, "year": year, "_month": month})
        rec[m.group(3).lower()] = parse_count(raw)
    out = []
    for rec in sorted(periods.values(), key=lambda r: (r["year"], r["_month"])):
        parts = [rec.get(k) for k in ("am", "md", "pm")]
        out.append({
            "period": rec["period"], "year": rec["year"],
            "am": parts[0], "md": parts[1], "pm": parts[2],
            "total": None if any(p is None for p in parts) else sum(parts),
        })
    return out


def nearest_station(path: Path) -> dict:
    df = pd.read_csv(path, dtype=str)
    xy = df["the_geom"].str.extract(r"POINT \(([-\d.]+) ([-\d.]+)\)").astype(float)
    df = df.assign(miles=miles_from_site(xy[1], xy[0]))
    row = df.sort_values("miles").iloc[0]
    return {
        "station": {
            "loc": int(row["Loc"]),
            "street": row["Street_Nam"],
            "from": row["From_Stree"],
            "to": row["To_Street"],
            "miles_from_site": round(float(row["miles"]), 2),
        },
        "series": station_series(row),
    }
