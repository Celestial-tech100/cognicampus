from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from .database import engine, get_db
from .models import Base, User, StudentProfile, UserRole
from .auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user
from pydantic import BaseModel


# Create tables in PostgreSQL automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CogniCampus API", version="1.0", docs_url=None, redoc_url="/redoc")

# Pydantic Schemas for Request Validation
class UserRegister(BaseModel):
    email: str
    password: str
    role: UserRole
    full_name: str
    cgpa: float
    branch: str
    skills: str

@app.get("/")
def read_root():
    return {"message": "Welcome to CogniCampus API - Campus Career Intelligence Platform"}

@app.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, hashed_password=hashed_pwd, role=user_data.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if user_data.role == UserRole.student:
        student_profile = StudentProfile(
            user_id=new_user.id,
            full_name=user_data.full_name,
            cgpa=user_data.cgpa,
            branch=user_data.branch,
            skills=user_data.skills
        )
        db.add(student_profile)
        db.commit()

    return {"message": "User registered successfully", "user_id": new_user.id}

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email, "role": current_user.role}

@app.get("/student/dashboard")
def get_student_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.student:
        raise HTTPException(status_code=403, detail="Access forbidden: Student role required")
    
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    return {
        "email": current_user.email,
        "role": current_user.role,
        "full_name": profile.full_name,
        "cgpa": profile.cgpa,
        "branch": profile.branch,
        "skills": profile.skills
    }

@app.get("/recruiter/candidates")
def get_recruiter_candidates(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.recruiter and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Access forbidden: Recruiter or Admin role required")
    
    students = db.query(StudentProfile).all()
    return {"candidates": students}

@app.post("/student/predict-career")
def predict_career_path(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.student:
        raise HTTPException(status_code=403, detail="Access forbidden: Student role required")
    
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    # Placeholder hook for Aishwarya's Scikit-learn ML model logic
    return {
        "student": profile.full_name,
        "cgpa": profile.cgpa,
        "recommended_role": "Software Engineer / Data Analyst",
        "readiness_score": min(95.0, profile.cgpa * 10 + 15)
    }

@app.get("/analytics/overview")
def get_institutional_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Access forbidden: Admin role required")
    
    total_students = db.query(StudentProfile).count()
    avg_cgpa = db.query(db.func.avg(StudentProfile.cgpa)).scalar() or 0.0
    
    return {
        "total_registered_students": total_students,
        "institutional_average_cgpa": round(float(avg_cgpa), 2)
    }