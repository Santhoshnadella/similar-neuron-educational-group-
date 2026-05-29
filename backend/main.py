from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging

from config import settings
from db.database import engine, Base
from auth.router import router as auth_router
from feed.router import router as feed_router
from content.router import router as content_router
from learning.router import router as learning_router
from agents.router import router as agents_router
from graphs.router import router as graphs_router
from users.router import router as users_router
from community.router import router as community_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events."""
    logger.info("🚀 KnowledgeVerse API starting up...")
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables ready")
    yield
    logger.info("🛑 KnowledgeVerse API shutting down...")


app = FastAPI(
    title="KnowledgeVerse API",
    description="AI-Native Educational Social Network + Adaptive LMS",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── Middleware ──────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(feed_router, prefix="/feed", tags=["Feed"])
app.include_router(content_router, prefix="/content", tags=["Content"])
app.include_router(learning_router, prefix="/learning", tags=["Learning"])
app.include_router(agents_router, prefix="/ai", tags=["AI Agents"])
app.include_router(graphs_router, prefix="/concepts", tags=["Knowledge Graph"])
app.include_router(community_router, prefix="/community", tags=["Community (Phase 3)"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": "KnowledgeVerse API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "knowledgeverse-api"}
