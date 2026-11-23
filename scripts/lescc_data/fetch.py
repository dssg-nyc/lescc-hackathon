"""Public API pulls, cached as dated snapshots in data/external/.

Snapshots are committed so builds are reproducible. Pass refresh=True to re-pull.
No keys are stored in code. The Census API key, if used, comes from CENSUS_API_KEY.
"""

from __future__ import annotations

import json
import os
from datetime import date
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
EXTERNAL = ROOT / "data" / "external"
TIMEOUT_S = 60
HEADERS = {"User-Agent": "lescc-data-build/0.1", "Accept": "application/json"}
SOCRATA = "https://data.cityofnewyork.us/resource"
CENSUS_REPORTER = "https://api.censusreporter.org/1.0/data/show/latest"


def _snapshot(name: str, url: str, params: dict, refresh: bool, compact: bool = False) -> dict:
    path = EXTERNAL / f"{name}.json"
    if path.exists() and not refresh:
        return json.loads(path.read_text(encoding="utf-8"))
    resp = requests.get(url, params=params, headers=HEADERS, timeout=TIMEOUT_S)
    resp.raise_for_status()
    safe_params = {k: v for k, v in params.items() if k != "key"}
    doc = {"pulled": date.today().isoformat(), "url": url, "params": safe_params, "data": resp.json()}
    EXTERNAL.mkdir(parents=True, exist_ok=True)
    text = json.dumps(doc, separators=(",", ":")) if compact else json.dumps(doc, indent=1)
    path.write_text(text + "\n", encoding="utf-8")
    return doc


def restaurants_manhattan(refresh: bool = False) -> dict:
    """DOHMH Restaurant Inspection Results (43nn-pn8j): one row per establishment."""
    return _snapshot(
        "dohmh_restaurants_mn",
        f"{SOCRATA}/43nn-pn8j.json",
        {
            "$select": "camis, max(zipcode) as zipcode, max(latitude) as lat, max(longitude) as lon",
            "$where": "boro='Manhattan'",
            "$group": "camis",
            "$limit": 50000,
        },
        refresh,
    )


def cultural_orgs_manhattan(refresh: bool = False) -> dict:
    """DCLA Cultural Organizations (u35m-9t32)."""
    return _snapshot(
        "dcla_cultural_orgs_mn",
        f"{SOCRATA}/u35m-9t32.json",
        {"$select": "organization_name, postcode, latitude, longitude", "$where": "borough='Manhattan'", "$limit": 5000},
        refresh,
    )


ACS_TABLES = "B01003,B19013,B03002"


def acs_latest(geo: str, name: str, refresh: bool = False) -> dict:
    """Latest ACS 5-year via Census Reporter (no key needed)."""
    return _snapshot(name, CENSUS_REPORTER, {"table_ids": ACS_TABLES, "geo_ids": geo}, refresh)


def acs_tract_income(year: int, refresh: bool = False) -> dict | None:
    """Prior-year tract income and population via the Census API. Needs CENSUS_API_KEY."""
    key = os.environ.get("CENSUS_API_KEY")
    path = EXTERNAL / f"acs{year}_5yr_mn_tracts.json"
    if not key and not path.exists():
        return None
    return _snapshot(
        f"acs{year}_5yr_mn_tracts",
        f"https://api.census.gov/data/{year}/acs/acs5",
        {"get": "B01003_001E,B19013_001E", "for": "tract:*", "in": "state:36 county:061", "key": key or ""},
        refresh,
    )


DATAUSA = "https://api.datausa.io/tesseract/data.jsonrecords"


def datausa_income(level: str, geo_id: str, name: str, refresh: bool = False) -> dict:
    """ACS 5-year median household income by year (B19013, all races) via DataUSA. No key needed."""
    return _snapshot(
        name,
        DATAUSA,
        {
            "cube": "acs_ygr_median_household_income_race_5",
            "drilldowns": f"Year,{level}",
            "measures": "Household Income by Race,Household Income by Race Moe",
            "include": f"{level}:{geo_id};Race:0",
        },
        refresh,
    )


def zip_boundaries(refresh: bool = False) -> dict:
    """NYC Modified ZCTA boundaries (pri4-ifjk), 178 ZIP areas."""
    return _snapshot("modzcta_boundaries", f"{SOCRATA}/pri4-ifjk.geojson", {"$limit": 500}, refresh, compact=True)


def restaurants_by_zip(refresh: bool = False) -> dict:
    """DOHMH distinct establishments per ZIP, citywide."""
    return _snapshot(
        "dohmh_restaurants_by_zip",
        f"{SOCRATA}/43nn-pn8j.json",
        {"$select": "zipcode, count(distinct camis) as n", "$group": "zipcode", "$limit": 5000},
        refresh,
    )


def cultural_orgs_by_zip(refresh: bool = False) -> dict:
    """DCLA cultural organizations per ZIP (mailing address), citywide."""
    return _snapshot(
        "dcla_cultural_orgs_by_zip",
        f"{SOCRATA}/u35m-9t32.json",
        {"$select": "postcode, count(*) as n", "$group": "postcode", "$limit": 5000},
        refresh,
    )
