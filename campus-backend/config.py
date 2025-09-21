# config.py
import os
from dotenv import load_dotenv

load_dotenv()  # loads .env

class Settings:
    DATABASE_URL: str = os.getenv("SUPABASE_URL")

settings = Settings()

print("DEBUG: DATABASE_URL =", settings.DATABASE_URL)  # temp debug
