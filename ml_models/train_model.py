"""Train a career-path classifier from historical student outcomes.

Expected CSV columns:
    cgpa, core_skills, career_path

`core_skills` is a pipe-separated list, e.g. "python|sql|statistics".
`career_path` is a documented historical outcome/category, e.g. "Data Analyst".
Use only data you are authorized to process. Do not include names, emails, IDs,
or other direct identifiers in the training file.
"""
from __future__ import annotations

import argparse
from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, StandardScaler
from sklearn.linear_model import LogisticRegression

ROOT = Path(__file__).resolve().parent
DEFAULT_DATA = ROOT / "student_history.csv"
ARTIFACT_DIR = ROOT / "artifacts"
MODEL_PATH = ARTIFACT_DIR / "career_recommender.joblib"
METRICS_PATH = ARTIFACT_DIR / "evaluation.json"


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


def build_pipeline() -> Pipeline:
    preprocess = ColumnTransformer(
        transformers=[
            ("cgpa", Pipeline([
                ("impute", SimpleImputer(strategy="median")),
                ("scale", StandardScaler()),
            ]), ["cgpa"]),
            ("skills", Pipeline([
                ("normalize", FunctionTransformer(normalize_skills, validate=False)),
                ("vectorize", CountVectorizer(binary=True, token_pattern=r"(?u)\b[\w+#.-]+\b")),
            ]), "core_skills"),
        ],
        remainder="drop",
    )
    return Pipeline([
        ("preprocess", preprocess),
        ("classifier", LogisticRegression(max_iter=2000, class_weight="balanced")),
    ])


def train(data_path: Path = DEFAULT_DATA) -> dict:
    if not data_path.exists():
        raise FileNotFoundError(
            f"Training data not found: {data_path}\n"
            "Create ml_models/student_history.csv using the documented schema. "
            "Do not train on fabricated examples."
        )

    df = pd.read_csv(data_path)
    required = {"cgpa", "core_skills", "career_path"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing required columns: {sorted(missing)}")

    df = df[list(required)].copy()
    df["cgpa"] = pd.to_numeric(df["cgpa"], errors="coerce")
    df["core_skills"] = df["core_skills"].fillna("").astype(str)
    df["career_path"] = df["career_path"].fillna("").astype(str).str.strip()
    df = df.dropna(subset=["cgpa"])
    df = df[(df["cgpa"] >= 0) & (df["cgpa"] <= 10)]
    df = df[(df["core_skills"].str.strip() != "") & (df["career_path"] != "")]

    if len(df) < 10:
        raise ValueError(
            f"Only {len(df)} valid rows remain. Provide at least 10 real, labeled "
            "historical records; substantially more are recommended."
        )
    if df["career_path"].nunique() < 2:
        raise ValueError("At least two distinct career_path labels are required.")
    if df["career_path"].value_counts().min() < 2:
        raise ValueError("Each career_path label needs at least 2 records for a stratified split.")

    X = df[["cgpa", "core_skills"]]
    y = df["career_path"]
    test_size = max(0.2, y.nunique() / len(y))
    if test_size >= 0.5:
        test_size = 0.4

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y
    )
    model = build_pipeline()
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    metrics = {
        "test_rows": int(len(y_test)),
        "train_rows": int(len(y_train)),
        "accuracy": float(accuracy_score(y_test, predictions)),
        "classification_report": classification_report(
            y_test, predictions, output_dict=True, zero_division=0
        ),
        "labels": sorted(y.unique().tolist()),
        "warning": (
            "Evaluation is only a baseline. Review per-class metrics and validate "
            "on a later cohort before using recommendations with students."
        ),
    }

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(f"Saved model: {MODEL_PATH}")
    print(f"Test accuracy: {metrics['accuracy']:.3f}")
    print(f"Saved metrics: {METRICS_PATH}")
    print("Reminder: this is a decision-support recommendation, not a placement guarantee.")
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA, help="Path to labeled CSV")
    args = parser.parse_args()
    train(args.data)
