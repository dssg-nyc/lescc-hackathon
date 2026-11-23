"""Build static JSON for the story app.

Reads data/ (never edits data/raw/) and public API snapshots in data/external/,
then writes pre-computed JSON to app/public/data/. Every file carries its
sources, pull dates, and a caveat. Values with no source are null: the app
shows "awaiting data". Do not fill them with guesses.

Usage:
    scripts/.venv/bin/python scripts/build_data.py            # use cached snapshots
    scripts/.venv/bin/python scripts/build_data.py --refresh  # re-pull public APIs
    CENSUS_API_KEY=... (optional) adds the 2020-2023 income trend.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path

import pandas as pd

from lescc_data import fetch
from lescc_data.acs import makeup, ring_estimates
from lescc_data.foot import nearest_station
from lescc_data.geo import RINGS_MI, SITE, miles_from_site, points_within
from lescc_data.quiz import build_quiz
from lescc_data.rings import ring_totals, tract_weights
from lescc_data.trend import project_range

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUT_DIR = ROOT / "app" / "public" / "data"
ZIP = "10002"
TREND_YEARS = (2020, 2021, 2022, 2023)
PROJECTION_YEAR = 2029
RECENT_FROM = 2019
# Lower East Side & Chinatown (Community District 3) PUMA, and Manhattan for comparison.
TREND_GEOS = [
    ("PUMA", "79500US3604103", "Lower East Side & Chinatown (CD3)", "datausa_income_cd3"),
    ("County", "05000US36061", "Manhattan", "datausa_income_manhattan"),
]
# LODES NAICS sectors: CNS18 = accommodation and food services (72),
# CNS17 = arts, entertainment, and recreation (71).
JOB_COLS = ["C000", "CNS17", "CNS18"]
OLD_FILES = ("baseline.json", "proposal.json", "map.json", "who.json")


def src(name: str, url: str | None, pulled: str | None) -> dict:
    return {"name": name, "url": url, "pulled": pulled}


def envelope(status: str, caveat: str, sources: list[dict], **payload) -> dict:
    return {"generated": date.today().isoformat(), "status": status, "caveat": caveat, "sources": sources, **payload}


def write(name: str, doc: dict, compact: bool = False) -> None:
    text = json.dumps(doc, separators=(",", ":")) if compact else json.dumps(doc, indent=2)
    (OUT_DIR / name).write_text(text + "\n", encoding="utf-8")
    print(f"wrote {name} ({doc['status']})")


# ---------- blocks and rings ----------

def manhattan_blocks() -> pd.DataFrame:
    x = pd.read_csv(
        DATA / "lodes" / "ny_xwalk.csv.gz",
        usecols=["tabblk2020", "trct", "zcta", "blklatdd", "blklondd"],
        dtype={"tabblk2020": str, "trct": str, "zcta": str},
    )
    x = x[x["tabblk2020"].str.startswith("36061")].copy()
    x["miles"] = miles_from_site(x["blklatdd"], x["blklondd"])
    return x


def points_in_rings(rows: list[dict], lat_key: str, lon_key: str) -> dict[str, int]:
    df = pd.DataFrame(rows)
    lat = pd.to_numeric(df.get(lat_key), errors="coerce")
    lon = pd.to_numeric(df.get(lon_key), errors="coerce")
    ok = lat.notna() & lon.notna() & (lat != 0)
    d = miles_from_site(lat[ok], lon[ok])
    return {str(r): int((d <= r).sum()) for r in RINGS_MI}


# ---------- cards ----------

def build_foot() -> dict:
    path = DATA / "Bi-Annual_Pedestrian_Counts_20261121.csv"
    s = nearest_station(path)
    latest = next(p for p in reversed(s["series"]) if p["total"] is not None)
    return envelope(
        "ok",
        "People counted during three weekday count periods (morning, midday, evening). Not a full-day total.",
        [src("NYC DOT Bi-Annual Pedestrian Counts", "https://data.cityofnewyork.us/Transportation/Bi-Annual-Pedestrian-Counts/2de2-6x2h", "2026-11-21")],
        station=s["station"],
        latest=latest,
        series=s["series"],
    )


def build_quiz_card(refresh: bool) -> tuple[dict, dict, dict]:
    rest = fetch.restaurants_manhattan(refresh)
    orgs = fetch.cultural_orgs_manhattan(refresh)
    n_rest = sum(1 for r in rest["data"] if (r.get("zipcode") or "").startswith(ZIP))
    n_orgs = sum(1 for r in orgs["data"] if (r.get("postcode") or "").startswith(ZIP))
    sources = [
        src("NYC DOHMH Restaurant Inspection Results (43nn-pn8j), distinct establishments", "https://data.cityofnewyork.us/d/43nn-pn8j", rest["pulled"]),
        src("NYC DCLA Cultural Organizations (u35m-9t32)", "https://data.cityofnewyork.us/d/u35m-9t32", orgs["pulled"]),
    ]
    doc = envelope(
        "ok",
        "Restaurants = establishments with a health inspection on record. Cultural organizations = groups on the DCLA list, by mailing address. Not every venue is listed.",
        sources,
        **build_quiz(n_rest, n_orgs),
    )
    return doc, rest, orgs


def build_residents(refresh: bool) -> dict:
    snap = fetch.acs_latest(f"86000US{ZIP}", f"acs_latest_zcta{ZIP}", refresh)
    geo = snap["data"]["data"][f"86000US{ZIP}"]
    release = snap["data"]["release"]["name"]
    return envelope(
        "ok",
        f"{release} estimates for ZCTA {ZIP}. Race and Hispanic origin are self-reported; groups do not overlap. Estimates carry margins of error.",
        [src(f"U.S. Census Bureau, {release}, table B03002 (via Census Reporter)", "https://censusreporter.org/profiles/86000US10002/", snap["pulled"])],
        geography=f"ZCTA {ZIP}",
        release=release,
        **makeup(geo),
    )


PLUTO_COLS = {"block", "lot", "bldgclass", "landuse", "yearbuilt", "bldgarea", "assesstot"}


def _num(value) -> float | None:
    return None if pd.isna(value) else float(value)


def pluto_site_history() -> list[dict]:
    rows = []
    for path in sorted((DATA / "pluto").glob("pluto_mn_*.csv")):
        year = int(re.search(r"(\d{4})", path.name).group(1))
        df = pd.read_csv(path, low_memory=False, usecols=lambda c: c in PLUTO_COLS)
        hit = df[(pd.to_numeric(df["block"], errors="coerce") == 415) & (pd.to_numeric(df["lot"], errors="coerce") == 150)]
        if hit.empty:
            rows.append({"year": year, "found": False})
            continue
        r = hit.iloc[0]
        rows.append({
            "year": year, "found": True,
            "bldgclass": None if pd.isna(r.get("bldgclass")) else str(r["bldgclass"]),
            "landuse": _num(r.get("landuse")),
            "yearbuilt": _num(r.get("yearbuilt")),
            "bldgarea": _num(r.get("bldgarea")),
            "assesstot": _num(r.get("assesstot")),
        })
    return rows


def build_site() -> dict:
    history = pluto_site_history()
    latest = next((h for h in reversed(history) if h["found"]), None)
    built = int(latest["yearbuilt"]) if latest and latest.get("yearbuilt") else None
    timeline = [
        {"year": built, "text": "Year built, per the tax lot record.", "status": "sourced" if built else "to_research",
         "source": "NYC DCP PLUTO" if built else None},
        {"year": 1956, "text": "Public building closed.", "status": "sourced",
         "source": "LESCC proposal deck (Rd2_LESCulturalCenter_Deck.pdf), p.2"},
        {"year": None, "text": "Original public use (comfort station).", "status": "to_research", "source": None},
        {"year": None, "text": "Vision: a community-run cultural center.", "status": "sourced",
         "source": "LESCC community bid (data/raw/lescc-community-bid.json)"},
    ]
    return envelope(
        "partial",
        "History points marked 'to research' have no source yet and are not shown as fact.",
        [src("NYC DCP PLUTO (Manhattan, 2002-2025)", "https://www.nyc.gov/site/planning/data-maps/open-data/dwn-pluto-mappluto.page", "2026-11-21"),
         src("NYC Planning Labs GeoSearch", SITE.geocoder, "2026-11-21")],
        address=SITE.address, lat=SITE.lat, lon=SITE.lon, bbl=SITE.bbl,
        lot=latest, lot_history=history, timeline=timeline,
    )


def lodes_rings(blocks: pd.DataFrame) -> tuple[list[dict], dict[str, dict]]:
    """Jobs by year in each ring and in ZIP 10002 (LODES WAC, all jobs)."""
    zip_blocks = set(blocks.loc[blocks["zcta"] == ZIP, "tabblk2020"])
    trend = []
    for path in sorted((DATA / "lodes").glob("ny_wac_S000_JT00_*.csv.gz")):
        year = int(re.search(r"_(\d{4})\.csv", path.name).group(1))
        wac = pd.read_csv(path, usecols=["w_geocode", *JOB_COLS], dtype={"w_geocode": str})
        wac = wac[wac["w_geocode"].str.startswith("36061")]
        rings = ring_totals(blocks, wac, JOB_COLS)
        z = wac[wac["w_geocode"].isin(zip_blocks)][JOB_COLS].sum()
        trend.append({
            "year": year,
            "rings": {str(r): {"total": v["C000"], "arts": v["CNS17"], "food": v["CNS18"]} for r, v in rings.items()},
            "zip": {"total": int(z["C000"]), "arts": int(z["CNS17"]), "food": int(z["CNS18"])},
        })
    return trend, (trend[-1]["rings"] if trend else {})


def _census_api_tracts(snap: dict) -> dict[str, tuple[float | None, float | None]]:
    header, *rows = snap["data"]
    idx = {h: i for i, h in enumerate(header)}
    out = {}
    for r in rows:
        pop, inc = r[idx["B01003_001E"]], r[idx["B19013_001E"]]
        inc_val = float(inc) if inc not in (None, "") and float(inc) > 0 else None
        out[f"36061{r[idx['tract']]}"] = (float(pop) if pop else None, inc_val)
    return out


def build_rings(refresh: bool, blocks: pd.DataFrame, jobs_latest: dict) -> dict:
    snap = fetch.acs_latest("140|05000US36061", "acs_latest_mn_tracts", refresh)
    release = snap["data"]["release"]["name"]
    tracts = {
        geoid.replace("14000US", ""): (d["B01003"]["estimate"]["B01003001"], d["B19013"]["estimate"]["B19013001"])
        for geoid, d in snap["data"]["data"].items()
    }
    weights = tract_weights(blocks)
    latest = ring_estimates(tracts, weights)

    trend = []
    trend_sources = []
    for year in TREND_YEARS:
        snap_y = fetch.acs_tract_income(year, refresh)
        if snap_y is None:
            continue
        est = ring_estimates(_census_api_tracts(snap_y), weights)
        trend.append({"release": f"ACS {year} 5-year", "rings": {str(k): v for k, v in est.items()}})
        trend_sources.append(src(f"U.S. Census Bureau API, ACS {year} 5-year", "https://api.census.gov", snap_y["pulled"]))
    trend.append({"release": release, "rings": {str(k): v for k, v in latest.items()}})

    area_trend = []
    for level, geo_id, label, name in TREND_GEOS:
        snap_t = fetch.datausa_income(level, geo_id, name, refresh)
        series = [
            {"year": int(r["Year"]), "median": round(r["Household Income by Race"]),
             "moe": round(r.get("Household Income by Race Moe") or 0)}
            for r in sorted(snap_t["data"]["data"], key=lambda r: r["Year"])
        ]
        area_trend.append({"geography": label, "series": series})
        trend_sources.append(src(f"ACS 5-year B19013 via DataUSA: {label}", "https://datausa.io", snap_t["pulled"]))
    projection = project_range(area_trend[0]["series"], PROJECTION_YEAR, RECENT_FROM) if area_trend else None

    rings = [
        {"miles": r, **latest.get(r, {"population": None, "median_income_est": None, "tracts": 0}),
         "jobs": jobs_latest.get(str(r))}
        for r in RINGS_MI
    ]
    has_trend = len(trend) > 1
    return envelope(
        "ok",
        "Tracts crossing a ring are weighted by their share of Census blocks inside it. Ring income is a population-weighted mean of tract medians, not a true median. The trend is for Community District 3, in nominal dollars, from overlapping 5-year windows. The projection is a trend range, not a forecast.",
        [src(f"U.S. Census Bureau, {release}, B01003 and B19013 (via Census Reporter)", "https://censusreporter.org", snap["pulled"]),
         src("Census LEHD LODES 8 block crosswalk and WAC", "https://lehd.ces.census.gov/data/", "2026-11-21"),
         *trend_sources],
        release=release,
        rings=rings,
        income_trend=trend if has_trend else None,
        area_trend=area_trend,
        projection=projection,
    )


# Parks solicitation M4-SB-2026 comparables (project README). Café and parkhouse, NOT food trucks.
CONCESSIONS = [
    {"name": "Hunter's Point South Café", "period": "8/2024-7/2025", "gross": 1334129.00, "fee": 201303.00},
    {"name": "McCarren Parkhouse", "period": "6/2024-5/2025", "gross": 1456041.00, "fee": 145603.70},
]

# Applicant model from the LESCC proposal deck. Unverified.
PROPOSAL = {
    "coffee_concession_per_day": 1000,
    "programming_per_month": 2000,
    "urban_gardening_per_year": 6000,
    "direct_costs": 260000,
    "fixed_costs": 95000,
}


def build_value(jobs_trend: list[dict], rest: dict, orgs: dict) -> dict:
    return envelope(
        "partial",
        "Not a like-for-like comparison. Parks café and parkhouse figures are concession comparables, not food truck benchmarks. Food truck revenue is not public. Restaurant and cultural organization counts are Manhattan only.",
        [src("Census LEHD LODES 8 WAC, sectors 71 and 72", "https://lehd.ces.census.gov/data/", "2026-11-21"),
         src("NYC DOHMH Restaurant Inspection Results (43nn-pn8j)", "https://data.cityofnewyork.us/d/43nn-pn8j", rest["pulled"]),
         src("NYC DCLA Cultural Organizations (u35m-9t32)", "https://data.cityofnewyork.us/d/u35m-9t32", orgs["pulled"]),
         src("NYC Parks solicitation M4-SB-2026, comparable concessions", None, "2026-11-21"),
         src("LESCC proposal deck, financial projections (applicant model, unverified)", None, "2026-11-21")],
        jobs_trend=[{"year": t["year"], **t["rings"]["0.5"]} for t in jobs_trend],
        food_supply={
            "restaurants": points_in_rings(rest["data"], "lat", "lon"),
            "cultural_orgs": points_in_rings(orgs["data"], "latitude", "longitude"),
        },
        concession_comparables=CONCESSIONS,
        proposal=PROPOSAL,
        food_truck_revenue=None,
        arts_center_revenue=None,
    )


def build_points(rest: dict, orgs: dict) -> dict:
    max_ring = max(RINGS_MI)
    return envelope(
        "ok",
        "Restaurants are establishments with a health inspection on record. Cultural organizations are DCLA-listed groups at their mailing address, which may differ from where they hold programs. Manhattan only: the Brooklyn part of the 2 mi ring is not shown.",
        [src("NYC DOHMH Restaurant Inspection Results (43nn-pn8j)", "https://data.cityofnewyork.us/d/43nn-pn8j", rest["pulled"]),
         src("NYC DCLA Cultural Organizations (u35m-9t32)", "https://data.cityofnewyork.us/d/u35m-9t32", orgs["pulled"])],
        site=[SITE.lon, SITE.lat],
        rings_miles=list(RINGS_MI),
        restaurants=points_within(rest["data"], "lat", "lon", max_ring),
        cultural_orgs=points_within(orgs["data"], "latitude", "longitude", max_ring),
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh", action="store_true", help="re-pull public API snapshots")
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    blocks = manhattan_blocks()
    jobs_trend, jobs_latest = lodes_rings(blocks)
    quiz, rest, orgs = build_quiz_card(args.refresh)

    write("foot.json", build_foot())
    write("quiz.json", quiz)
    write("acs.json", build_residents(args.refresh))
    write("site.json", build_site())
    write("rings.json", build_rings(args.refresh, blocks, jobs_latest))
    write("value.json", build_value(jobs_trend, rest, orgs))
    write("points.json", build_points(rest, orgs), compact=True)

    for old in OLD_FILES:
        path = OUT_DIR / old
        if path.exists():
            path.unlink()
            print(f"removed retired {old}")


if __name__ == "__main__":
    main()
