"""Quiz card: restaurants vs arts and cultural organizations in ZIP 10002."""

from __future__ import annotations


def build_quiz(restaurants: int | None, cultural: int | None) -> dict:
    has_both = restaurants is not None and cultural is not None and cultural > 0
    answer = None
    ratio = None
    if has_both:
        answer = "restaurants" if restaurants >= cultural else "cultural"
        ratio = round(max(restaurants, cultural) / min(restaurants, cultural), 1)
    return {
        "question": "Which is more common in ZIP 10002?",
        "options": [
            {"id": "restaurants", "label": "Restaurants", "count": restaurants},
            {"id": "cultural", "label": "Art and cultural organizations", "count": cultural},
        ],
        "answer": answer,
        "ratio": ratio,
    }
