from lescc_data.quiz import build_quiz


def test_answer_is_the_larger_count_and_ratio_is_rounded():
    q = build_quiz(restaurants=622, cultural=60)
    assert q["answer"] == "restaurants"
    assert q["ratio"] == 10.4


def test_no_answer_when_a_count_is_missing():
    q = build_quiz(restaurants=None, cultural=60)
    assert q["answer"] is None and q["ratio"] is None
