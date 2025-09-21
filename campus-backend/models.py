# models.py
from sqlalchemy import Column, String, DateTime, func, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from database import Base

# ---------- Student ----------
class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    last_active = Column(DateTime, server_default=func.now())

    # Relationship to logs
    activities = relationship("ActivityLog", back_populates="student", cascade="all, delete-orphan")


# ---------- Activity Log ----------
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id", ondelete="CASCADE"))
    action = Column(Text, default="login")
    timestamp = Column(DateTime, server_default=func.now())

    student = relationship("Student", back_populates="activities")
