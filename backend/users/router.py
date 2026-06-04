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
    """Phase 3 Gamification: Get user achievements dynamically generated based on progression."""
    achievements = []
    
    # 1. First Step
    achievements.append({
        "id": "ach_first_step",
        "title": "First Step",
        "description": "Start your learning journey",
        "unlocked": current_user.xp > 0
    })
    
    # 2. Streak achievements
    achievements.append({
        "id": "ach_streak_3",
        "title": "Consistent Learner",
        "description": "Reach a 3-day learning streak",
        "unlocked": current_user.streak >= 3
    })
    
    # 3. Level achievements
    achievements.append({
        "id": "ach_level_5",
        "title": "Scholar",
        "description": "Reach Level 5",
        "unlocked": current_user.level >= 5
    })
    
    # 4. Deep Work
    # Since we don't have a deep work count yet, we'll mark it false by default unless they have high XP
    achievements.append({
        "id": "ach_deep_work",
        "title": "Deep Thinker",
        "description": "Complete your first deep work session",
        "unlocked": current_user.xp > 1000  # Proxy for now
    })
    
    return {"achievements": achievements}


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

@router.get("/me/dashboard_stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Phase 3 Gamification: Get dashboard stats for human optimization."""
    from db.models import LearningSession
    from sqlalchemy import select, func, extract
    
    # 1. Total Deep Work Hours
    result = await db.execute(
        select(LearningSession)
        .where(LearningSession.user_id == current_user.id)
    )
    sessions = result.scalars().all()
    
    total_seconds = sum(s.watch_time for s in sessions if s.watch_time)
    total_deep_work_hours = round(total_seconds / 3600.0, 1) if sessions else 0.0
    
    # 2. Average Focus Score
    focus_scores = [s.focus_score for s in sessions if s.focus_score]
    average_focus = int(sum(focus_scores) / len(focus_scores)) if focus_scores else 0
    
    # 3. Time Series & Peak Cognitive Hour
    # Group by hour to find average focus per hour
    # We will build a complete 24-hour dictionary to ensure we cover all times
    hour_focus = {f"{h:02d}:00": [] for h in range(0, 24, 2)}
    
    for s in sessions:
        if s.focus_score and s.started_at:
            h = s.started_at.hour
            # bucket into 2-hour windows (0, 2, 4, 6...)
            bucket = (h // 2) * 2
            hour_focus[f"{bucket:02d}:00"].append(s.focus_score)
            
    time_series = []
    best_hour = "10:00"
    max_avg = -1
    
    for time_bucket, scores in hour_focus.items():
        avg = int(sum(scores) / len(scores)) if scores else 0
        time_series.append({"time": time_bucket, "focus": avg})
        if avg > max_avg and avg > 0:
            max_avg = avg
            best_hour = time_bucket
            
    # Default visual if no data
    if not sessions:
        time_series = [
            {"time": "06:00", "focus": 0},
            {"time": "08:00", "focus": 0},
            {"time": "10:00", "focus": 0},
            {"time": "12:00", "focus": 0},
            {"time": "14:00", "focus": 0},
            {"time": "16:00", "focus": 0},
            {"time": "18:00", "focus": 0},
            {"time": "20:00", "focus": 0},
        ]
        best_hour = "N/A"
    else:
        # filter to just daylight hours for clean UI if they have data
        time_series = [ts for ts in time_series if 6 <= int(ts["time"].split(":")[0]) <= 22]

    return {
        "total_deep_work_hours": total_deep_work_hours,
        "optimal_time": best_hour,
        "average_focus": average_focus,
        "time_series": time_series
    }
