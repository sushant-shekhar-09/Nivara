"""
Database Engine & Async Session Setup for Nivara AI.
Supports PostgreSQL 16 / Supabase (postgresql+asyncpg) with SSL, connection pooling, and SQLite test fallback.
"""

import os
import ssl
from typing import AsyncGenerator
from urllib.parse import urlparse
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession, AsyncEngine
from sqlalchemy.orm import declarative_base

from nivara.backend.config import settings

def build_async_engine(database_url: str | None = None) -> AsyncEngine:
    """
    Constructs an asynchronous SQLAlchemy engine tailored for PostgreSQL / Supabase
    with TLS verification, robust connection pooling, and SQLite test isolation.
    """
    url = database_url or settings.DATABASE_URL

    # Ensure async driver scheme for postgresql
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    is_sqlite = url.startswith("sqlite")
    is_postgres = url.startswith("postgresql")

    engine_kwargs: dict = {
        "echo": False,
        "future": True,
    }

    if is_postgres:
        connect_args: dict = {
            "timeout": settings.DB_CONNECT_TIMEOUT,
            # statement_cache_size=0 allows safe operation through Supabase / PgBouncer poolers
            "statement_cache_size": 0,
        }

        # Parse host for SSL / TLS configuration
        try:
            parsed = urlparse(url.replace("postgresql+asyncpg://", "http://", 1))
            host = parsed.hostname or ""
        except Exception:
            host = ""

        # Enforce TLS for remote/Supabase connections
        is_remote = host not in ("localhost", "127.0.0.1", "")
        if is_remote and settings.DB_SSL_REQUIRED:
            ssl_ca_path = os.getenv("DB_SSL_CA_PATH")
            if ssl_ca_path and os.path.exists(ssl_ca_path):
                ssl_ctx = ssl.create_default_context(cafile=ssl_ca_path)
                ssl_ctx.check_hostname = True
                ssl_ctx.verify_mode = ssl.CERT_REQUIRED
                connect_args["ssl"] = ssl_ctx
            elif "supabase" in host or "pooler" in host:
                # Supabase uses its own intermediate CA; ssl='require' enforces TLS encryption over the wire
                connect_args["ssl"] = "require"
            else:
                ssl_ctx = ssl.create_default_context()
                ssl_ctx.check_hostname = True
                ssl_ctx.verify_mode = ssl.CERT_REQUIRED
                connect_args["ssl"] = ssl_ctx

        engine_kwargs.update({
            "connect_args": connect_args,
            "pool_size": settings.DB_POOL_SIZE,
            "max_overflow": settings.DB_MAX_OVERFLOW,
            "pool_recycle": settings.DB_POOL_RECYCLE,
            "pool_pre_ping": True,
        })
    elif is_sqlite:
        from sqlalchemy.pool import StaticPool
        engine_kwargs.update({
            "connect_args": {"check_same_thread": False},
            "poolclass": StaticPool
        })
    else:
        from sqlalchemy.pool import NullPool
        engine_kwargs["poolclass"] = NullPool

    return create_async_engine(url, **engine_kwargs)


engine = build_async_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
