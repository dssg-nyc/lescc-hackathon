import pytest

from lescc_data.trend import cagr, project_range


def test_cagr_matches_compound_growth():
    assert cagr(100, 121, 2) == pytest.approx(0.10)


def test_projection_range_uses_long_and_recent_growth():
    series = [{"year": 2013, "median": 100.0}, {"year": 2019, "median": 110.0}, {"year": 2024, "median": 130.0}]
    p = project_range(series, target_year=2029, recent_from=2019)
    low_rate, high_rate = sorted([cagr(100, 130, 11), cagr(110, 130, 5)])
    assert p["year"] == 2029
    assert p["low"] == round(130 * (1 + low_rate) ** 5)
    assert p["high"] == round(130 * (1 + high_rate) ** 5)
    assert "trend" in p["method"].lower()


def test_projection_needs_two_points():
    assert project_range([{"year": 2024, "median": 1.0}], 2029, 2019) is None
