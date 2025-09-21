# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings
import os 
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv('SUPABASE_URL')
# ✅ Create engine from DATABASE_URL (Supabase Postgres URL)
engine = create_engine(settings.DATABASE_URL, future=True)

# ✅ DB session
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# ✅ Base class for models
Base = declarative_base()

# ✅ Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
