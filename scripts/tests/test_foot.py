import pandas as pd

from lescc_data.foot import parse_count, period_label, station_series


def test_parse_count_handles_commas_blanks_and_numbers():
    assert parse_count("1,158") == 1158
    assert parse_count(1217.0) == 1217
    assert parse_count("") is None
    assert parse_count(float("nan")) is None


def test_period_label_reads_month_and_year():
    assert period_label("May07") == ("May 2007", 2007, 5)
    assert period_label("Sept26") == ("Sep 2026", 2026, 9)
    assert period_label("June24") == ("Jun 2024", 2024, 6)
    assert period_label("Oct20") == ("Oct 2020", 2020, 10)


def test_station_series_groups_am_md_pm_and_sorts_by_date():
    row = pd.Series({
        "Oct25_AM": "1,123", "Oct25_PM": "3,933", "Oct25_MD": "3,566",
        "May26_AM": 1217.0, "May26_MD": 3547.0, "May26_pM": 4315.0,
    })
    series = station_series(row)
    assert [p["period"] for p in series] == ["Oct 2025", "May 2026"]
    assert series[1] == {"period": "May 2026", "year": 2026, "am": 1217, "md": 3547, "pm": 4315, "total": 9079}


def test_total_is_none_when_any_period_is_missing():
    row = pd.Series({"May26_AM": 1, "May26_MD": None, "May26_PM": 3})
    assert station_series(row)[0]["total"] is None
