from lescc_data.zips import ratio_by_zip, simplify_features

SQUARE = {
    "type": "Feature",
    "properties": {"modzcta": "10002"},
    "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[[-73.99, 40.71], [-73.98, 40.71], [-73.98, 40.72], [-73.985, 40.7200001], [-73.99, 40.72], [-73.99, 40.71]]]],
    },
}


def test_simplify_keeps_zip_and_drops_redundant_points():
    out = simplify_features([SQUARE], tolerance=0.0005, digits=4)
    assert out[0]["zip"] == "10002"
    ring = out[0]["polygons"][0][0]
    assert len(ring) == 5  # the near-collinear point is gone
    assert ring[0] == [-73.99, 40.71]


def test_ratio_by_zip_handles_missing_and_zero_orgs():
    out = ratio_by_zip(["10002", "10003", "10004"], {"10002": 622, "10003": 900}, {"10002": 58, "10004": 3})
    assert out["10002"] == {"restaurants": 622, "cultural": 58, "ratio": 10.7}
    assert out["10003"] == {"restaurants": 900, "cultural": 0, "ratio": None}
    assert out["10004"] == {"restaurants": 0, "cultural": 3, "ratio": 0.0}
