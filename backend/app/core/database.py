"""Database configuration and connection setup for Supabase PostgreSQL"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData
from .config import settings

# Database metadata and base class
metadata = MetaData()

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models"""
    metadata = metadata

# Database engine and session configuration
engine = None
async_session_maker = None

def init_database():
    """Initialize database engine and session maker"""
    global engine, async_session_maker
    
    if not settings.database_url:
        raise ValueError("DATABASE_URL not configured. Please set your Supabase PostgreSQL connection string.")
    
    # Create async engine for PostgreSQL
    engine = create_async_engine(
        settings.database_url,
        echo=settings.debug,  # Log SQL queries in debug mode
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=3600,   # Recycle connections every hour
    )
    
    # Create async session maker
    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=True,
        autocommit=False,
    )

async def get_database_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get database session for FastAPI endpoints
    
    Usage in FastAPI endpoints:
        async def some_endpoint(db: AsyncSession = Depends(get_database_session)):
            # Use db session here
    """
    if async_session_maker is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def create_tables():
    """Create all tables in the database (for development/testing)"""
    if engine is None:
        raise RuntimeError("Database engine not initialized.")
    
    async with engine.begin() as conn:
        # In production, you might want to use Alembic migrations instead
        await conn.run_sync(Base.metadata.create_all)

async def close_database():
    """Close database connections (for application shutdown)"""
    if engine:
        await engine.dispose()
