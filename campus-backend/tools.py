from agents import function_tool
from database import SessionLocal
from models import Student, ActivityLog
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

# --- Import FAISS + Embeddings for RAG ---
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import os

# Load the saved FAISS vectorstore
embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/multi-qa-distilbert-cos-v1")
vectorstore = FAISS.load_local("orca_vectorstore", embedding, allow_dangerous_deserialization=True)


# ---------- RAG FAQ TOOL ----------
@function_tool
def faq_rag_tool(question: str) -> str:
    """
    Answer FAQs from the stored PDF (converted_text.pdf) using vector search.
    """
    if not question.strip():
        return "⚠️ Please provide a valid question."

    try:
        docs = vectorstore.similarity_search(question, k=3)
        if not docs:
            return "⚠️ No relevant FAQ found in the knowledge base."

        # Combine top docs into a context
        context = "\n\n".join([d.page_content for d in docs])

        return f"📘 Based on our guide:\n{context}"

    except Exception as e:
        return f"⚠️ Error retrieving FAQ: {str(e)}"



# ---------- DB Helper Functions (for internal use) ----------
def db_get_total_students(db: Session) -> int:
    return db.query(Student).count()

def db_get_recent_students(db: Session, limit: int = 5):
    return db.query(Student).order_by(Student.created_at.desc()).limit(limit).all()


# ---------- CRUD TOOLS ----------
@function_tool
def add_student(id: str, name: str, department: str = None, email: str = None) -> dict:
    """Add a new student"""
    db = SessionLocal()
    try:
        student = Student(id=id, name=name, department=department, email=email)
        db.add(student)
        db.commit()
        db.refresh(student)
        return {
            "status": "success",
            "student": {
                "id": student.id,
                "name": student.name,
                "department": student.department,
                "email": student.email
            }
        }
    finally:
        db.close()


@function_tool
def get_student(id: str) -> dict:
    """Fetch student by ID"""
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.id == id).first()
        if not student:
            return {"status": "error", "message": "Student not found"}
        return {
            "id": student.id,
            "name": student.name,
            "department": student.department,
            "email": student.email
        }
    finally:
        db.close()


@function_tool
def update_student(id: str, field: str, value: str) -> dict:
    """Update a student field"""
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.id == id).first()
        if not student:
            return {"status": "error", "message": "Student not found"}
        setattr(student, field, value)
        db.commit()
        db.refresh(student)
        return {
            "status": "success",
            "student": {
                "id": student.id,
                "name": student.name,
                "department": student.department,
                "email": student.email
            }
        }
    finally:
        db.close()


@function_tool
def delete_student(id: str) -> dict:
    """Delete student by ID"""
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.id == id).first()
        if not student:
            return {"status": "error", "message": "Student not found"}
        db.delete(student)
        db.commit()
        return {"status": "success", "message": f"Deleted student {id}"}
    finally:
        db.close()


@function_tool
def list_students(limit: int = 10) -> dict:
    """List students"""
    db = SessionLocal()
    try:
        students = db.query(Student).limit(limit).all()
        return {
            "students": [
                {"id": s.id, "name": s.name, "department": s.department, "email": s.email}
                for s in students
            ]
        }
    finally:
        db.close()


# ---------- ANALYTICS TOOLS ----------
@function_tool
def get_total_students() -> dict:
    """Get total student count"""
    db = SessionLocal()
    try:
        count = db.query(Student).count()
        return {"total_students": count}
    finally:
        db.close()


@function_tool
def get_students_by_department() -> dict:
    """Get student count grouped by department"""
    db = SessionLocal()
    try:
        result = db.query(Student.department, func.count(Student.id)).group_by(Student.department).all()
        return {
            "by_department": [{"department": dept, "count": count} for dept, count in result]
        }
    finally:
        db.close()


@function_tool
def get_last_added_students(limit: int = 5) -> dict:
    """Get the last N onboarded students"""
    db = SessionLocal()
    try:
        students = db.query(Student).order_by(Student.created_at.desc()).limit(limit).all()
        return {
            "recent_students": [
                {"id": s.id, "name": s.name, "department": s.department, "email": s.email}
                for s in students
            ]
        }
    finally:
        db.close()


@function_tool
def get_active_students(days: int = 7) -> dict:
    """Get students active in the last N days"""
    db = SessionLocal()
    try:
        since = datetime.utcnow() - timedelta(days=days)
        logs = db.query(ActivityLog).filter(ActivityLog.timestamp >= since).all()
        return {
            "active_students": [
                {"student_id": log.student_id, "action": log.action, "timestamp": str(log.timestamp)}
                for log in logs
            ]
        }
    finally:
        db.close()


# ---------- NOTIFICATION ----------
@function_tool
def send_email(student_id: str, message: str) -> dict:
    """Mock sending email to a student (replace with real SMTP later)"""
    db = SessionLocal()
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student or not student.email:
            return {"status": "error", "message": "No email found"}
        print(f"[MOCK EMAIL] To {student.email} | {message}")
        return {"status": "sent", "to": student.email, "message": message}
    finally:
        db.close()

