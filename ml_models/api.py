"""Optional FastAPI adapter for the student dashboard.

Run from the repository root:
    uvicorn ml_models.api:app --reload --port 8000
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from ml_models.predictor import recommend_career

app = FastAPI(
    title="Cognicampus Career Recommendation API",
    version="0.1.0",
    description="Decision-support recommendations from CGPA and core skills.",
)


class RecommendationRequest(BaseModel):
    cgpa: float = Field(ge=0, le=10, description="CGPA on a 10-point scale")
    core_skills: list[str] = Field(min_length=1, max_length=50)
    top_k: int = Field(default=3, ge=1, le=10)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/career-recommendations")
def career_recommendations(request: RecommendationRequest):
    try:
        recommendations = recommend_career(
            cgpa=request.cgpa,
            core_skills=request.core_skills,
            top_k=request.top_k,
        )
        return {
            "recommendations": recommendations,
            "disclaimer": (
                "Model scores indicate relative class confidence, not hiring probability "
                "or a guarantee of placement."
            ),
        }
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
