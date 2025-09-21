# agent.py
from agents import Agent, OpenAIChatCompletionsModel, Runner
from tools import (
    add_student,
    get_student,
    update_student,
    delete_student,
    list_students,
    get_total_students,
    get_students_by_department,
    get_recent_onboarded,
    send_email,
    faq_tool,
)
from utils.guardrails import is_blocked

import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()
gemini_api_key = os.getenv("GEMINI_API_KEY")

# --- Init Gemini Client ---
client = AsyncOpenAI(
    api_key=gemini_api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

campus_admin_agent = Agent(
    name="Campus Admin Agent",
    instructions="""
You are the **Campus Admin AI Agent**.  
Your purpose is to assist a campus admin with:
- Managing students (Create, Read, Update, Delete)
- Providing analytics (total students, by department, recent onboarded)
- Sending notifications (email)
- Answering FAQs about the system.

### CRITICAL RESPONSE RULES:
1. **When the user asks for a list of students**, ALWAYS return the data in **valid JSON-like structure** EXACTLY as shown below for **each student**:
[
  {
    "Student Id": "student id",
    "Student Name": "student name",
    "Student Email": "student email",
    "Student Department": "student department"
  }
]

2. **If no students are found**, return:
[]
(do not add extra words or explanation outside the brackets).

3. When answering FAQs or providing guidance, use **plain English text** (normal conversation)  
   – Only use the JSON format when showing student records.

4. Use tools ONLY when needed to get real data.  
   Never invent or hallucinate student information.

Follow these instructions strictly.
""",
    tools=[
        add_student,
        get_student,
        update_student,
        delete_student,
        list_students,
        get_total_students,
        get_students_by_department,
        get_recent_onboarded,
        send_email,
        faq_tool,
    ],
    model=OpenAIChatCompletionsModel(model="gemini-2.0-flash", openai_client=client),
)


# Wrapper to call the agent
async def run_agent(message: str) -> str:
    result = await Runner.run(campus_admin_agent, message)
    return result.final_output
