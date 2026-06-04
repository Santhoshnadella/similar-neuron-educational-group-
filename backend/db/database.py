from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config import settings

# Convert sync URL to async if needed
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

if "sqlite" in db_url:
    engine = create_async_engine(
        db_url,
        echo=settings.APP_ENV == "development",
        connect_args={"check_same_thread": False},
    )
else:
    # Handle sslmode for asyncpg
    connect_args = {}
    if "sslmode=" in db_url or "ssl=" in db_url:
        db_url = db_url.replace("?sslmode=require", "")
        db_url = db_url.replace("&sslmode=require", "")
        db_url = db_url.replace("sslmode=require", "")
        db_url = db_url.replace("?ssl=require", "")
        db_url = db_url.replace("&ssl=require", "")
        db_url = db_url.replace("ssl=require", "")
        
        db_url = db_url.replace("?&", "?")
        if db_url.endswith("?"):
            db_url = db_url[:-1]
            
        connect_args["ssl"] = "require"
        
    engine = create_async_engine(
        db_url,
        echo=settings.APP_ENV == "development",
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        connect_args=connect_args,
    )

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    """Dependency for getting database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
