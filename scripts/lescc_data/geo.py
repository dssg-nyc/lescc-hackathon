"""Site location and ring distances."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

EARTH_RADIUS_MI = 3958.8
RINGS_MI: tuple[float, ...] = (0.5, 1.0, 2.0)


@dataclass(frozen=True)
class Site:
    address: str
    lat: float
    lon: float
    bbl: str
    geocoder: str


# NYC Planning Labs GeoSearch v2, queried 2026-11-21: "76 DELANCEY STREET".
SITE = Site(
    address="76 Delancey St, New York, NY 10002",
    lat=40.719552,
    lon=-73.990207,
    bbl="1004150150",
    geocoder="https://geosearch.planninglabs.nyc/v2/search?text=76 Delancey St Manhattan",
)


def miles_from_site(lat, lon):
    """Great-circle distance in miles. Works on scalars, arrays, and Series."""
    p1, p2 = np.radians(SITE.lat), np.radians(lat)
    dp = p2 - p1
    dl = np.radians(lon - SITE.lon)
    a = np.sin(dp / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dl / 2) ** 2
    return 2 * EARTH_RADIUS_MI * np.arcsin(np.sqrt(a))


def assign_ring(miles) -> list[float | None]:
    """Smallest ring (miles) that contains each distance, or None if outside all rings."""
    out: list[float | None] = []
    for d in np.asarray(miles, dtype=float):
        out.append(next((r for r in RINGS_MI if d <= r), None))
    return out


def points_within(rows: list[dict], lat_key: str, lon_key: str, miles: float) -> list[list[float]]:
    """[lon, lat] pairs (5 decimals, ~1 m) for rows within `miles` of the site.

    Skips missing and 0,0 placeholder coordinates.
    """
    out: list[list[float]] = []
    for r in rows:
        try:
            lat, lon = float(r.get(lat_key)), float(r.get(lon_key))
        except (TypeError, ValueError):
            continue
        if lat == 0 or lon == 0:
            continue
        if float(miles_from_site(lat, lon)) <= miles:
            out.append([round(lon, 5), round(lat, 5)])
    return out
