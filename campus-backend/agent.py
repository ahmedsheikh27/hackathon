from agents import Agent, OpenAIChatCompletionsModel, Runner
from tools import *  # ✅ import all tools at once
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
- Providing analytics (total students, by department, recent onboarded, active students)
- Sending notifications (email)
- Answering FAQs about the system
- Engaging in general conversation when appropriate.

### CRITICAL RESPONSE RULES:

1. **When asked for analytics (like total students, students by department, recent onboarded, last active students, etc.), ALWAYS use the provided analytics tools** instead of responding manually.

2. **When the user asks for a list of students**, ALWAYS return the data in **valid JSON-like structure** EXACTLY as shown below for **each student**:
[
  {
    "Student Id": "student id",
    "Student Name": "student name",
    "Email": "student email",
    "Department": "student department"
  }
]

3. **If no students are found**, return:
[]

4. When answering FAQs or providing guidance, use **plain English text**.  
   Only use JSON format when showing student records.

5. Use tools ONLY when needed to fetch actual data.  
   Never invent or hallucinate student information.

6. IMPORTANT:  
   - Use `get_students_by_department` when asked for student count grouped by department.  
   - Use `get_total_students` for total student count.  
   - Use `get_recent_onboarded` for last onboarded students.  
   - Use `get_active_students` when asked about active students in the last N days.

7. **General Knowledge & Conversation**  
   - If the user asks a general knowledge question (not related to campus tools), you may answer using your own reasoning and language model knowledge without using tools.  
   - If the user compliments you (e.g., “You’re helpful” / “Good job”), reply warmly and appreciatively.  
   - If the question is conversational (e.g., greetings, jokes, small talk), respond naturally and kindly, without tools.  
""",
    tools=[
        add_student,
        get_student,
        update_student,
        delete_student,
        list_students,
        get_total_students,
        get_students_by_department,
        get_last_added_students,
        get_active_students,
        send_email,
        faq_tool,
    ],
    model=OpenAIChatCompletionsModel(model="gemini-2.0-flash", openai_client=client),
)


# Wrapper to call the agent
async def run_agent(message: str) -> str:
    result = await Runner.run(campus_admin_agent, message)
    return result.final_output
