from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from db.database import get_db
from db.models import User
from auth.dependencies import get_current_user
from feed import service as feed_service
from feed.schemas import FeedResponse

router = APIRouter()


@router.get("/personalized", response_model=FeedResponse)
async def get_personalized_feed(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get AI-ranked personalized learning feed."""
    return await feed_service.get_personalized_feed(db, current_user, page, limit)


@router.get("/trending", response_model=FeedResponse)
async def get_trending_feed(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    domain: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get trending educational content."""
    return await feed_service.get_trending_feed(db, page, limit, domain)


@router.get("/following", response_model=FeedResponse)
async def get_following_feed(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get feed from creators you follow."""
    return await feed_service.get_following_feed(db, current_user, page, limit)
