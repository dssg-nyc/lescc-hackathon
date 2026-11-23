"""Income trend helpers. Projections are trend extrapolations, not forecasts."""

from __future__ import annotations


def cagr(start: float, end: float, years: int) -> float:
    return (end / start) ** (1 / years) - 1


def project_range(series: list[dict], target_year: int, recent_from: int) -> dict | None:
    """Range from two growth rates: full-period and recent-period CAGR."""
    pts = sorted((p for p in series if p.get("median")), key=lambda p: p["year"])
    if len(pts) < 2:
        return None
    first, last = pts[0], pts[-1]
    recent = next((p for p in pts if p["year"] >= recent_from), first)
    rates = [cagr(first["median"], last["median"], last["year"] - first["year"])]
    if recent["year"] < last["year"]:
        rates.append(cagr(recent["median"], last["median"], last["year"] - recent["year"]))
    lo, hi = min(rates), max(rates)
    n = target_year - last["year"]
    return {
        "year": target_year,
        "low": round(last["median"] * (1 + lo) ** n),
        "high": round(last["median"] * (1 + hi) ** n),
        "method": (
            f"Trend extrapolation in nominal dollars: compound growth {first['year']}-{last['year']} "
            f"({lo:.1%}) to {recent['year']}-{last['year']} ({hi:.1%}). Not a forecast and not an effect of the arts center."
        ),
    }
