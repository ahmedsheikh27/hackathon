from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Student
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/students", tags=["Students"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class StudentCreate(BaseModel):
    id: str
    name: str
    department: Optional[str] = None
    email: Optional[str] = None

class StudentUpdate(BaseModel):
    field: str
    value: str


# ---------- CRUD ----------
@router.post("/", summary="Add new student")
def add_student(data: StudentCreate, db: Session = Depends(get_db)):
    student = Student(**data.dict())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@router.get("/{student_id}", summary="Get student by ID")
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {"status": "error", "message": "Student not found"}
    return student

@router.put("/{student_id}", summary="Update student field")
def update_student(student_id: str, data: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {"status": "error", "message": "Student not found"}
    setattr(student, data.field, data.value)
    db.commit()
    db.refresh(student)
    return student

@router.delete("/{student_id}", summary="Delete student")
def delete_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {"status": "error", "message": "Student not found"}
    db.delete(student)
    db.commit()
    return {"status": "success", "message": f"Deleted student {student_id}"}

@router.get("/", summary="List students")
def list_students(limit: int = 10, db: Session = Depends(get_db)):
    students = db.query(Student).limit(limit).all()
    return students


# ---------- Analytics ----------
@router.get("/analytics/total", summary="Get total student count")
def get_total_students(db: Session = Depends(get_db)):
    count = db.query(Student).count()
    return {"total_students": count}

@router.get("/analytics/by-department", summary="Get students grouped by department")
def get_students_by_department(db: Session = Depends(get_db)):
    result = db.query(Student.department, func.count(Student.id))\
               .group_by(Student.department).all()
    return [{"department": dept, "count": count} for dept, count in result]

@router.get("/analytics/recent", summary="Get recent onboarded students")
def get_recent_students(limit: int = 5, db: Session = Depends(get_db)):
    students = db.query(Student).order_by(Student.created_at.desc()).limit(limit).all()
    return students
