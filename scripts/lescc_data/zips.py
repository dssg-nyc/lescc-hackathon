"""NYC ZIP (MODZCTA) outlines for the line-art maps, and per-ZIP ratios."""

from __future__ import annotations

from shapely.geometry import mapping, shape


def _round(coords, digits: int):
    if isinstance(coords[0], (int, float)):
        return [round(coords[0], digits), round(coords[1], digits)]
    return [_round(c, digits) for c in coords]


def simplify_features(features: list[dict], tolerance: float, digits: int) -> list[dict]:
    """Douglas-Peucker simplify each ZIP, keep topology, round coordinates.

    Returns [{"zip": "10002", "polygons": [[ring, ...], ...]}] (MultiPolygon coordinates).
    """
    out = []
    for f in features:
        geom = shape(f["geometry"]).simplify(tolerance, preserve_topology=True)
        if geom.is_empty:
            continue
        g = mapping(geom)
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        out.append({"zip": f["properties"]["modzcta"], "polygons": _round([list(map(list, p)) for p in polys], digits)})
    return out


def ratio_by_zip(zips: list[str], restaurants: dict[str, int], cultural: dict[str, int]) -> dict[str, dict]:
    """Restaurants per cultural organization. None when a ZIP has no listed organizations."""
    out = {}
    for z in zips:
        r, c = restaurants.get(z, 0), cultural.get(z, 0)
        out[z] = {"restaurants": r, "cultural": c, "ratio": round(r / c, 1) if c else None}
    return out
