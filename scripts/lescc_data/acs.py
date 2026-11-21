"""ACS: residential makeup (ZCTA 10002) and ring population and income."""

from __future__ import annotations

# B03002: Hispanic or Latino origin by race. Groups are mutually exclusive.
GROUPS = [
    ("Asian", "B03002006"),
    ("Hispanic or Latino", "B03002012"),
    ("White", "B03002003"),
    ("Black", "B03002004"),
]


def makeup(geo_data: dict) -> dict:
    est = geo_data["B03002"]["estimate"]
    total = est["B03002001"]
    groups = [{"label": label, "count": int(est[code])} for label, code in GROUPS]
    other = total - sum(g["count"] for g in groups)
    groups.append({"label": "Other or multiracial", "count": int(other)})
    for g in groups:
        g["share"] = round(g["count"] / total, 3)
    groups.sort(key=lambda g: g["count"], reverse=True)
    return {
        "population": int(geo_data["B01003"]["estimate"]["B01003001"]),
        "median_household_income": geo_data["B19013"]["estimate"]["B19013001"],
        "groups": groups,
    }


def ring_estimates(tracts: dict[str, tuple[float | None, float | None]], weights: dict) -> dict[float, dict]:
    """tracts: trct (11-digit GEOID) -> (population, median income).

    Population: weighted sum. Income: population-weighted mean of tract medians
    (an approximation; medians cannot be summed exactly).
    """
    out: dict[float, dict] = {}
    for (ring, trct), w in weights.items():
        pop, income = tracts.get(trct, (None, None))
        if pop is None:
            continue
        acc = out.setdefault(ring, {"pop": 0.0, "inc_num": 0.0, "inc_den": 0.0, "tracts": 0})
        acc["pop"] += pop * w
        acc["tracts"] += 1
        if income is not None and income > 0:
            acc["inc_num"] += income * pop * w
            acc["inc_den"] += pop * w
    return {
        ring: {
            "population": round(a["pop"]),
            "median_income_est": round(a["inc_num"] / a["inc_den"]) if a["inc_den"] else None,
            "tracts": a["tracts"],
        }
        for ring, a in sorted(out.items())
    }
