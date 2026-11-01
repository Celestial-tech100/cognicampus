import os
import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database configuration: support environment override, local MySQL/PostgreSQL, or fallback SQLite
DEFAULT_DB_URL = "mysql+pymysql://root:root@localhost/cognicampus_db"
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    # If primary database (PostgreSQL/MySQL) driver is missing or server is offline,
    # fall back to local SQLite so the platform runs immediately without manual server setup
    print(f"[CogniCampus DB] Primary DB ({SQLALCHEMY_DATABASE_URL.split('@')[-1]}) not reachable: {e}")
    print("[CogniCampus DB] Falling back to local SQLite database: sqlite:///./cognicampus.db")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./cognicampus.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
