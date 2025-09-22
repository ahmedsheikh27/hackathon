from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

import models
from config import settings
from database import engine, get_db
from agent import run_agent
from schemas import StudentCreate, StudentUpdate, ChatRequest
from fastapi.middleware.cors import CORSMiddleware


# ✅ Create SQL tables (for dev; in production, use Alembic migrations)
print("DATABASE_URL =", settings.DATABASE_URL)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Campus Admin Agent (Supabase)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================
#   STUDENT ROUTES (CRUD)
# ============================

@app.post("/students")
def create_student(payload: StudentCreate, db: Session = Depends(get_db)):
    student = models.Student(**payload.dict())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@app.get("/students/{student_id}")
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.put("/students/{student_id}")
def update_student_route(student_id: str, payload: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)
    return student


@app.delete("/students/{student_id}")
def delete_student_route(student_id: str, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return {"status": "success", "message": f"Deleted student {student_id}"}


@app.get("/students")
def list_students_route(db: Session = Depends(get_db)):
    """Return all students (no limit)."""
    students = db.query(models.Student).all()
    return {
        "students": [
            {
                "id": s.id,
                "name": s.name,
                "department": s.department,
                "email": s.email,
                "created_at": s.created_at
            }
            for s in students
        ]
    }


# ============================
#   ANALYTICS ROUTES
# ============================

@app.get("/analytics/total")
def total_students(db: Session = Depends(get_db)):
    return {"total_students": db.query(models.Student).count()}


@app.get("/analytics/recent")
def recent_students(db: Session = Depends(get_db), limit: int = 5):
    students = db.query(models.Student).order_by(models.Student.created_at.desc()).limit(limit).all()
    return {"recent_students": students}


@app.get("/analytics/by-department")
def students_by_department(db: Session = Depends(get_db)):
    result = db.query(models.Student.department, 
                      models.func.count(models.Student.id))\
               .group_by(models.Student.department).all()
    return {"by_department": [{"department": dept, "count": count} for dept, count in result]}


@app.get("/analytics/active")
def active_students(days: int = 7, db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(days=days)
    logs = db.query(models.ActivityLog).filter(models.ActivityLog.timestamp >= since).all()
    active = [
        {"student_id": log.student_id, "action": log.action, "timestamp": log.timestamp}
        for log in logs
    ]
    return {"active_students": active}


# ============================
#   CHAT ROUTES
# ============================

@app.post("/chat")
async def chat(req: ChatRequest):
    reply = await run_agent(req.message)
    return {"reply": reply}


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    reply = await run_agent(req.message)

    async def generator(text: str):
        for i in range(0, len(text), 50):
            yield f"data: {text[i:i+50]}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generator(reply), media_type="text/event-stream")
