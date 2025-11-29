from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings
import ssl

DATABASE_URL = settings.DATABASE_URL

# Create SSL context (Neon requires TLS)
ssl_ctx = ssl.create_default_context()

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    pool_recycle=180,   # recycle connections every 3 minutes
    pool_timeout=30,
    connect_args={"ssl": ssl_ctx},   # <-- required for asyncpg
)

# ---------------------------
# Session Factory
# ---------------------------
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# ---------------------------
# Base Model
# ---------------------------
Base = declarative_base()

# ---------------------------
# DB Dependency
# ---------------------------
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# -----------------------------------------------------------
# AUTO-CREATE TABLES (important for Neon)
# -----------------------------------------------------------
async def init_models():
    """
    Creates all tables automatically on startup.
    Works with Neon PostgreSQL.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
