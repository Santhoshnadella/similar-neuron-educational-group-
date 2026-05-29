from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from db.database import get_db
from db.models import User, Follow
from auth.dependencies import get_current_user
from auth.schemas import UserResponse
from pydantic import BaseModel

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.get("/{username}", response_model=UserResponse)
async def get_user_profile(username: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)


@router.patch("/me/xp")
async def update_xp(
    xp_gained: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user XP and level."""
    current_user.xp += xp_gained
    current_user.level = max(1, current_user.xp // 1000)
    await db.commit()
    return {"xp": current_user.xp, "level": current_user.level}


@router.get("/me/achievements")
async def get_achievements(current_user: User = Depends(get_current_user)):
    """Phase 3 Gamification: Get user achievements"""
    return {"achievements": [{"id": 1, "title": "First Step", "description": "Completed first learning session", "unlocked": True}]}


@router.get("/search")
async def search_users(
    q: str = Query(..., min_length=1, max_length=100),
    db: AsyncSession = Depends(get_db),
):
    """Search for users by username or bio."""
    from sqlalchemy import or_
    
    stmt = (
        select(User)
        .where(
            or_(
                User.username.ilike(f"%{q}%"),
                User.bio.ilike(f"%{q}%"),
            )
        )
        .limit(20)
    )
    result = await db.execute(stmt)
    users = result.scalars().all()
    return {"results": [UserResponse.model_validate(u) for u in users]}


@router.post("/{user_id}/follow")
async def follow_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Follow a user."""
    
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    # Check if already following
    existing = await db.execute(
        select(Follow).where(
            and_(
                Follow.follower_id == current_user.id,
                Follow.following_id == user_id,
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already following")
    
    # Create follow relationship
    follow = Follow(follower_id=current_user.id, following_id=user_id)
    db.add(follow)
    await db.commit()
    
    return {"status": "following"}


@router.delete("/{user_id}/follow")
async def unfollow_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Unfollow a user."""
    
    stmt = select(Follow).where(
        and_(
            Follow.follower_id == current_user.id,
            Follow.following_id == user_id,
        )
    )
    result = await db.execute(stmt)
    follow = result.scalar_one_or_none()
    
    if not follow:
        raise HTTPException(status_code=404, detail="Not following")
    
    await db.delete(follow)
    await db.commit()
    
    return {"status": "unfollowed"}


@router.get("/{user_id}/followers")
async def get_followers(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get list of followers."""
    
    stmt = (
        select(Follow)
        .where(Follow.following_id == user_id)
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(stmt)
    follows = result.scalars().all()
    
    # Get follower users
    follower_ids = [f.follower_id for f in follows]
    followers_stmt = select(User).where(User.id.in_(follower_ids))
    followers_result = await db.execute(followers_stmt)
    followers = followers_result.scalars().all()
    
    return {"followers": [UserResponse.model_validate(u) for u in followers], "total": len(followers)}


@router.get("/{user_id}/following")
async def get_following(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get list of users being followed."""
    
    stmt = (
        select(Follow)
        .where(Follow.follower_id == user_id)
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(stmt)
    follows = result.scalars().all()
    
    # Get following users
    following_ids = [f.following_id for f in follows]
    following_stmt = select(User).where(User.id.in_(following_ids))
    following_result = await db.execute(following_stmt)
    following = following_result.scalars().all()
    
    return {"following": [UserResponse.model_validate(u) for u in following], "total": len(following)}
