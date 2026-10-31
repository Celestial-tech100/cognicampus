# Cognicampus ML: Career Recommendations

This module predicts **historical career-path categories** from CGPA and core skills.
It is a recommendation aid, not a placement guarantee or a hiring-probability estimator.

## 1. Training data

Create `ml_models/student_history.csv` with these exact columns:

| cgpa | core_skills | career_path |
|---:|---|---|
| 8.4 | python\|sql\|excel | Data Analyst |
| 7.7 | java\|dsa\|oop | Software Developer |

The two rows above illustrate the format only; **they are not a usable training dataset**.
Use real, authorized historical records and remove direct identifiers. Each row should
represent an outcome with a consistently defined label. Do not infer a career label from
CGPA alone.

Recommended: hundreds of records, representative classes, data quality checks, and
evaluation on a later cohort. Do not use the sample rows as evidence of model quality.

## 2. Install and train

From the repository root:

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r ml_models/requirements.txt
python ml_models/train_model.py
```

The script saves `ml_models/artifacts/career_recommender.joblib` and
`ml_models/artifacts/evaluation.json`. The artifact directory is generated during training.

## 3. Use the helper

```python
from ml_models.predictor import recommend_career

results = recommend_career(
    cgpa=8.2,
    core_skills=["Python", "SQL", "Excel"],
    top_k=3,
)
print(results)
```

Example response shape (scores shown here are illustrative, not model output):

```json
[
  {"career_path": "Data Analyst", "score": 0.62},
  {"career_path": "Software Developer", "score": 0.25},
  {"career_path": "QA Engineer", "score": 0.13}
]
```

Scores are relative classifier confidence across the known labels, not the probability
that a student will be hired.

## 4. Optional API

```bash
uvicorn ml_models.api:app --reload --port 8000
```

Send `POST http://localhost:8000/api/career-recommendations`:

```json
{
  "cgpa": 8.2,
  "core_skills": ["Python", "SQL", "Excel"],
  "top_k": 3
}
```

Interactive API docs: `http://localhost:8000/docs`.

## Integration notes

- Keep this model behind a backend API; do not try to load the `.joblib` file in React.
- The current frontend appears to be a separate application, so call the API from an existing
  backend or a trusted server-side integration layer.
- Configure CORS narrowly if the frontend calls this API from another origin.
- Add authentication, authorization, rate limiting, request logging with privacy safeguards,
  and deployment configuration before production.
- Only load model artifacts produced by a trusted source. `joblib` uses Python pickle
  mechanisms and must not load untrusted files.
- Re-train and version the model when labels, skills vocabulary, or student cohorts change.
- Review precision/recall per class, calibration, subgroup performance, and drift. Avoid using
  sensitive attributes or proxies as decision criteria; students should be able to contest
  or ignore recommendations.
