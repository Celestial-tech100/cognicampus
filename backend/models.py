from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime , Date
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base


class UserRole(str, enum.Enum):
    student = "student"
    recruiter = "recruiter"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String, nullable=False)
    cgpa = Column(Float, nullable=False)
    branch = Column(String, nullable=False)
    skills = Column(String, nullable=False)
    resume_url = Column(String, nullable=True)

    user = relationship("User", back_populates="student_profile")
    
class Placement(Base):
    __tablename__ = "placements"

    placement_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    company_name = Column(String(100), nullable=True)
    package_lpa = Column(Float, nullable=True)
    placement_status = Column(String(20), default="Not Placed") # 'Placed' or 'Not Placed'
    placement_date = Column(Date, nullable=True)

    student_profile = relationship("StudentProfile", backref="placements")