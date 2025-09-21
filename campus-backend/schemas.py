# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class StudentCreate(BaseModel):
    id: str
    name: str
    department: Optional[str]
    email: Optional[EmailStr]

class StudentUpdate(BaseModel):
    name: Optional[str]
    department: Optional[str]
    email: Optional[EmailStr]

class ChatRequest(BaseModel):
    message: str
