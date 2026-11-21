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
