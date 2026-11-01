"""Small helper for the student dashboard to obtain career-path suggestions."""
from __future__ import annotations

import sys
from pathlib import Path
from functools import lru_cache
import pandas as pd
import joblib


def normalize_skills(series: pd.Series) -> pd.Series:
    """Normalize pipe-separated skills to lowercase whitespace-separated text."""
    return (
        series.fillna("")
        .astype(str)
        .str.lower()
        .str.replace(r"\s*\|\s*", " ", regex=True)
        .str.replace(r"[^a-z0-9+#.\- ]", " ", regex=True)
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )


# Crucial fix: Joblib pickled models may reference normalize_skills in __main__
# Inject normalize_skills into __main__ so unpickling succeeds in any runner/process
import __main__
if not hasattr(__main__, "normalize_skills"):
    setattr(__main__, "normalize_skills", normalize_skills)

MODEL_PATH = Path(__file__).resolve().parent / "artifacts" / "career_recommender.joblib"


@lru_cache(maxsize=1)
def _load_model():
    if not MODEL_PATH.exists():
        raise RuntimeError(
            "Career recommendation model is not trained yet. "
            "Run `python ml_models/train_model.py` with historical data first."
        )
    # Ensure __main__ has normalize_skills before loading
    if not hasattr(__main__, "normalize_skills"):
        setattr(__main__, "normalize_skills", normalize_skills)
    return joblib.load(MODEL_PATH)


def recommend_career(cgpa: float, core_skills: list[str], top_k: int = 3) -> list[dict]:
    """Return ranked career categories with model scores.

    Example:
        recommend_career(8.2, ["Python", "SQL", "Excel"])
    Scores are classifier probabilities, not probabilities of getting hired.
    """
    if not isinstance(cgpa, (int, float)) or not 0 <= float(cgpa) <= 10:
        raise ValueError("cgpa must be a number between 0 and 10")
    if not core_skills or any(not isinstance(s, str) or not s.strip() for s in core_skills):
        raise ValueError("core_skills must be a non-empty list of skill names")
    if not isinstance(top_k, int) or top_k < 1:
        raise ValueError("top_k must be a positive integer")

    model = _load_model()
    row = pd.DataFrame([{
        "cgpa": float(cgpa),
        "core_skills": "|".join(s.strip() for s in core_skills),
    }])
    probabilities = model.predict_proba(row)[0]
    classes = model.named_steps["classifier"].classes_
    ranked = sorted(zip(classes, probabilities), key=lambda item: item[1], reverse=True)[:top_k]
    return [
        {"career_path": str(label), "score": round(float(score), 4)}
        for label, score in ranked
    ]
