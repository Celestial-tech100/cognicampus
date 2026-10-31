# CogniCampus: Campus Career Intelligence Platform

**CogniCampus** is a fully integrated, full-stack system designed to replace fragmented, manual placement tracking. It provides a secure, role-based platform bridging students, recruiters, and university administration with predictive career analytics and automated placement management.

## 🚀 Key Features

* **Role-Based Workflows:** Three tailored client interfaces (Students, Recruiters, Institutional Managers) with isolated views and permissions.
* **Enterprise-Grade Security:** Stateless JWT (HS256) session management and cryptographic password hashing using `bcrypt` (no plain-text storage).
* **Machine Learning Intelligence:** Scikit-learn prediction engine that analyzes student CGPA and technical skills to generate data-driven career trajectory insights.
* **Institutional Analytics:** Comprehensive placement oversight, batch statistics, and branch-placement performance queries.
* **Relational Integrity:** Fully normalized MySQL schema mapping Users (1-to-1) to Student Profiles.

## 💻 System Architecture & Tech Stack

CogniCampus utilizes a modern, 4-layer production-ready architecture:

1. **Frontend (Client Interface):** React, Vite, and Tailwind CSS for highly responsive, rapid-compilation UI.
2. **Backend (REST APIs):** FastAPI (Python 3.13) providing high-performance, asynchronous execution.
3. **Database (Relational Layer):** MySQL integrated via SQLAlchemy ORM.
4. **Machine Learning (Prediction Engine):** Scikit-learn and Pandas.

## 👥 Team & Module Ownership

This project was developed collaboratively by 3rd-year B.Tech (CSE & IT) students at the Subharti Institute of Technology & Engineering:

* **Divya H Kishore (Team Lead):** Backend Service Specification, Database Architecture, SQLAlchemy Models, and FastAPI Authentication Protocols.
* **Aishwarya Chourasia:** Machine Learning Analytics, Profile Attributes Matching, and Scikit-learn Pipeline.
* **Shani Kumar:** React Frontend Initialization, User Interface, and Responsive Client Components.
* **Himani Jadon:** Data Architecture, Institutional Analytics, and Documentation.

## 🛠️ Local Installation & Setup

### Prerequisites
* **Python 3.13**
* **Node.js & npm**
* **MySQL** (Running locally with a database created named `cognicampus_db`)

### 1. Backend Setup
Navigate into the backend directory and install dependencies:

```bash
cd backend
py -m pip install fastapi uvicorn sqlalchemy pymysql pyjwt bcrypt python-multipart pandas scikit-learn
```
*(Note: Ensure your `database.py` connection string is set to `mysql+pymysql://user:password@localhost/cognicampus_db`)*

Run the FastAPI server:
```bash
py -m uvicorn main:app --reload
```
*The backend server will run asynchronously on `http://127.0.0.1:8000`.*
*Interactive API Swagger documentation is available at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup
Open a separate terminal window, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The client interface will run on `http://localhost:5173`.*

## 🔒 API Endpoints Overview

* `GET /` : Health check and operational verification.
* `POST /register` : Atomic multi-role signup with input validation.
* `POST /token` : OAuth2 secure credentials exchange for JWT access.
* `GET /student/dashboard` : Protected student profile retrieval.
* `GET /recruiter/candidates` : Protected pipeline of candidate profiles for recruiters.
* `POST /student/predict-career` : Hooks into the ML pipeline for placement prediction.
* `GET /analytics/branch-placement-rates` : Executes raw SQL for institutional statistics.

---
*Project Complete: Delivered and ready for deployment.*