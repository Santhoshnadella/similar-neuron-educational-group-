from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.models import User, Achievement

async def check_and_unlock_achievements(db: AsyncSession, user: User, event_type: str, event_data: dict = None):
    """
    Event-driven achievement system.
    Evaluates unlocking conditions based on the event.
    """
    if event_type == "session_ended":
        # Check streak badge
        if user.streak >= 7:
            await _unlock_achievement(db, user, "7-Day Streak", "Consistently learned for a week", "🔥")
        if user.streak >= 30:
            await _unlock_achievement(db, user, "30-Day Scholar", "Consistently learned for a month", "🎓")
            
        # Check XP badge
        if user.xp >= 10000:
            await _unlock_achievement(db, user, "10k XP Club", "Earned 10,000 XP", "⭐")
            
    elif event_type == "game_completed":
        # Check cognitive index badge
        from db.models import CognitiveProfile
        result = await db.execute(select(CognitiveProfile).where(CognitiveProfile.id == user.cognitive_profile_id))
        profile = result.scalar_one_or_none()
        if profile and getattr(profile, "cognitive_index", 0) > 85:
            await _unlock_achievement(db, user, "Galaxy Brain", "Reached a Cognitive Index > 85", "🧠")


async def _unlock_achievement(db: AsyncSession, user: User, name: str, description: str, icon: str):
    # Check if already unlocked
    result = await db.execute(select(Achievement).where(Achievement.user_id == user.id, Achievement.name == name))
    existing = result.scalar_one_or_none()
    
    if not existing:
        ach = Achievement(
            user_id=user.id,
            name=name,
            description=description,
            icon=icon
        )
        db.add(ach)
        await db.flush()
        print(f"Achievement Unlocked for User {user.username}: {name}")
