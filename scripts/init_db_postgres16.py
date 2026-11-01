import asyncio
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from nivara.backend.database import engine, Base
from nivara.backend.models import User, StudentProfile, ScreeningSession, CrisisAuditLog

async def init_tables():
    print("Connecting to PostgreSQL 16 with SQLAlchemy async engine...")
    async with engine.begin() as conn:
        print("Dropping existing tables if any...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables (users, student_profiles, screening_sessions, crisis_audit_logs)...")
        await conn.run_sync(Base.metadata.create_all)
    print("PostgreSQL 16 tables successfully created and verified!")

if __name__ == "__main__":
    asyncio.run(init_tables())
