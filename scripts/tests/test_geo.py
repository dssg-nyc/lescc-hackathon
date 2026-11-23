import numpy as np
import pandas as pd

from lescc_data.geo import RINGS_MI, SITE, assign_ring, miles_from_site


def test_site_is_zero_miles_from_itself():
    assert miles_from_site(SITE.lat, SITE.lon) < 1e-9


def test_one_hundredth_degree_of_latitude_is_about_0_69_miles():
    d = miles_from_site(SITE.lat + 0.01, SITE.lon)
    assert 0.68 < d < 0.70


def test_vectorized_distances():
    lats = pd.Series([SITE.lat, SITE.lat + 0.01])
    lons = pd.Series([SITE.lon, SITE.lon])
    out = miles_from_site(lats, lons)
    assert len(out) == 2 and out.iloc[0] < out.iloc[1]


def test_assign_ring_uses_smallest_ring_that_contains_the_point():
    assert RINGS_MI == (0.5, 1.0, 2.0)
    assert list(assign_ring(np.array([0.1, 0.5, 0.7, 1.9, 2.1]))) == [0.5, 0.5, 1.0, 2.0, None]


def test_points_within_keeps_close_valid_points_rounded():
    from lescc_data.geo import points_within

    rows = [
        {"lat": str(SITE.lat + 0.001), "lon": str(SITE.lon)},  # ~0.07 mi
        {"lat": str(SITE.lat + 0.1), "lon": str(SITE.lon)},  # ~7 mi
        {"lat": "0", "lon": "0"},  # placeholder coordinates
        {"lat": None, "lon": None},
    ]
    out = points_within(rows, "lat", "lon", 2.0)
    assert out == [[round(SITE.lon, 5), round(SITE.lat + 0.001, 5)]]
