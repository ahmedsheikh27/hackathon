from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from openai import OpenAI
import os

router = APIRouter(prefix="/chat", tags=["Chat"])
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ChatRequest(BaseModel):
    message: str

@router.post("/", summary="Single-turn chat")
def chat(request: ChatRequest):
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content":request.message}]
    )
    return {"response": resp.choices[0].message.content}

@router.post("/stream", summary="Streaming chat")
def chat_stream(request: ChatRequest):
    def generate():
        with client.chat.completions.stream(
            model="gpt-4o-mini",
            messages=[{"role":"user","content":request.message}]
        ) as stream:
            for chunk in stream:
                if chunk.type == "message":
                    yield chunk.message.content
    return StreamingResponse(generate(), media_type="text/plain")
