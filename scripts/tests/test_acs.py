from lescc_data.acs import makeup, ring_estimates


def test_makeup_sorts_groups_and_adds_other():
    geo = {
        "B01003": {"estimate": {"B01003001": 100}},
        "B19013": {"estimate": {"B19013001": 50000}},
        "B03002": {"estimate": {"B03002001": 100, "B03002003": 20, "B03002004": 10, "B03002006": 40, "B03002012": 25}},
    }
    m = makeup(geo)
    assert [g["label"] for g in m["groups"]][:2] == ["Asian", "Hispanic or Latino"]
    assert m["groups"][-1] == {"label": "Other or multiracial", "count": 5, "share": 0.05}


def test_ring_income_is_population_weighted_and_skips_missing_income():
    tracts = {"A": (1000, 40000), "B": (3000, 80000), "C": (500, None)}
    weights = {(0.5, "A"): 1.0, (0.5, "B"): 0.5, (0.5, "C"): 1.0}
    r = ring_estimates(tracts, weights)[0.5]
    assert r["population"] == 3000
    assert r["median_income_est"] == round((40000 * 1000 + 80000 * 1500) / 2500)
    assert r["tracts"] == 3
