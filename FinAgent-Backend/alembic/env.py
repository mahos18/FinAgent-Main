import asyncio
from logging.config import fileConfig
from app import models
from app.models.user import User
from app.models.transactions import Transaction

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from alembic import context

from app.core.database import Base
from app.core.config import settings

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """Run synchronous migration commands."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' (async) mode."""
    async def async_main():
        engine = create_async_engine(
            settings.DATABASE_URL,
            poolclass=pool.NullPool,
            future=True,
            echo=False
        )

        async with engine.begin() as conn:
            await conn.run_sync(do_run_migrations)

        await engine.dispose()

    asyncio.run(async_main())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
