import os
import sys
import asyncio
import ssl
from pathlib import Path
from urllib.parse import urlparse
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
config = context.config

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import nivara.backend.models
from nivara.backend.database import Base
from nivara.backend.config import settings

target_metadata = Base.metadata

# Override sqlalchemy.url with runtime settings / DATABASE_URL env var
db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
config.set_main_option("sqlalchemy.url", db_url.replace("%", "%%"))


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode with asyncpg."""
    section = dict(config.get_section(config.config_ini_section, {}))
    url = config.get_main_option("sqlalchemy.url") or settings.DATABASE_URL
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    section["sqlalchemy.url"] = url
    
    connect_args = {}
    if url.startswith("postgresql"):
        connect_args["statement_cache_size"] = 0
        try:
            parsed = urlparse(url.replace("postgresql+asyncpg://", "http://", 1))
            host = parsed.hostname or ""
        except Exception:
            host = ""
        is_remote = host not in ("localhost", "127.0.0.1", "")
        if (is_remote or "supabase" in host) and settings.DB_SSL_REQUIRED:
            ssl_ca_path = os.getenv("DB_SSL_CA_PATH")
            if ssl_ca_path and os.path.exists(ssl_ca_path):
                ctx = ssl.create_default_context(cafile=ssl_ca_path)
                ctx.check_hostname = True
                ctx.verify_mode = ssl.CERT_REQUIRED
                connect_args["ssl"] = ctx
            elif "supabase" in host or "pooler" in host:
                connect_args["ssl"] = "require"
            else:
                ctx = ssl.create_default_context()
                ctx.check_hostname = True
                ctx.verify_mode = ssl.CERT_REQUIRED
                connect_args["ssl"] = ctx

    connectable = async_engine_from_config(
        section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args=connect_args if connect_args else None,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
