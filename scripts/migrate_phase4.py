import asyncio
from nivara.backend.database import engine, Base
from sqlalchemy import text
from nivara.backend.models import ResearchConsortium, ConsortiumMembership

async def migrate():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        try:
            await conn.execute(text("ALTER TABLE research_surveys ADD COLUMN IF NOT EXISTS consortium_id VARCHAR(36) REFERENCES research_consortia(id);"))
            print("Successfully added consortium_id column to research_surveys.")
        except Exception as e:
            print(f"Migration note: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
