import pandas as pd

from lescc_data.rings import ring_totals, tract_weights


def blocks():
    # tract A: 2 blocks in 0.5 mi ring, 2 blocks beyond 2 mi. tract B: 1 block in 1 mi ring.
    return pd.DataFrame({
        "tabblk2020": ["a1", "a2", "a3", "a4", "b1"],
        "trct": ["A", "A", "A", "A", "B"],
        "miles": [0.1, 0.4, 3.0, 3.1, 0.8],
    })


def test_tract_weights_are_share_of_blocks_within_each_cumulative_ring():
    w = tract_weights(blocks())
    assert w[(0.5, "A")] == 0.5
    assert w[(1.0, "A")] == 0.5
    assert w[(1.0, "B")] == 1.0
    assert (0.5, "B") not in w


def test_ring_totals_sum_jobs_by_block_within_each_cumulative_ring():
    jobs = pd.DataFrame({"w_geocode": ["a1", "a2", "b1", "a3"], "C000": [10, 5, 7, 100]})
    out = ring_totals(blocks(), jobs, ["C000"])
    assert out[0.5]["C000"] == 15
    assert out[1.0]["C000"] == 22
    assert out[2.0]["C000"] == 22
