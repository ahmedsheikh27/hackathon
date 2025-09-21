from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

import models
from config import settings
from database import engine, get_db
from agent import run_agent
from schemas import ChatRequest
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

# --- Analytics (protected) ---
@app.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    total = db.query(models.Student).count()
    recent = db.query(models.Student).order_by(models.Student.created_at.desc()).limit(5).all()
    return {
        "total_students": total,
        "recent_onboarded": [
            {"id": s.id, "name": s.name, "email": s.email}
            for s in recent
        ]
    }


# --- Chat with Agent (student/general chat) ---
@app.post("/chat")
async def chat(req: ChatRequest):
    reply = await run_agent(req.message)
    return {"reply": reply}


# --- Streaming Chat ---
@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    reply = await run_agent(req.message)

    async def generator(text: str):
        for i in range(0, len(text), 50):
            yield f"data: {text[i:i+50]}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generator(reply), media_type="text/event-stream")
