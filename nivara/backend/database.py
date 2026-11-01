"""
Database Engine & Async Session Setup for Nivara AI.
Uses SQLAlchemy 2.0 async with asyncpg (PostgreSQL 16) and aiosqlite fallback.
"""

from typing import AsyncGenerator
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from nivara.backend.config import settings

# Engine configuration with NullPool to prevent event loop / connection sharing conflicts in asyncpg
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    poolclass=NullPool
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
