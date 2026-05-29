"""
Learning Analytics — Track and analyze user learning behavior and progress.
Powers cognitive profile updates and feed personalization.
"""
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timedelta, timezone

from db.models import User, LearningSession, Content, FlashCard


async def get_user_analytics(
    db: AsyncSession,
    user: User,
) -> Dict[str, Any]:
    """Extract comprehensive user analytics for matchmaking and recommendations."""
    
    cognitive_profile = {
        "working_memory": user.cognitive_profile.working_memory if user.cognitive_profile else 50.0,
        "processing_speed": user.cognitive_profile.processing_speed if user.cognitive_profile else 50.0,
        "attention_control": user.cognitive_profile.attention_control if user.cognitive_profile else 50.0,
        "spatial_reasoning": user.cognitive_profile.spatial_reasoning if user.cognitive_profile else 50.0,
        "creativity": user.cognitive_profile.creativity if user.cognitive_profile else 50.0,
        "emotional_regulation": user.cognitive_profile.emotional_regulation if user.cognitive_profile else 50.0,
        "verbal_intelligence": user.cognitive_profile.verbal_intelligence if user.cognitive_profile else 50.0,
        "cognitive_index": user.cognitive_profile.cognitive_index if user.cognitive_profile else 50.0,
    }
    
    # Get recent learning sessions
    stmt = (
        select(LearningSession)
        .where(LearningSession.user_id == user.id)
        .order_by(desc(LearningSession.created_at))
        .limit(100)
    )
    result = await db.execute(stmt)
    sessions = result.scalars().all()
    
    # Extract engagement history
    engaged_domains = set()
    preferred_types = {}
    retention_by_domain = {}
    comprehension_scores = []
    focus_scores = []
    
    for session in sessions:
        if session.content:
            if session.content.domain:
                engaged_domains.add(session.content.domain)
                # Track retention by domain
                if session.recall_score:
                    if session.content.domain not in retention_by_domain:
                        retention_by_domain[session.content.domain] = []
                    retention_by_domain[session.content.domain].append(session.recall_score)
            
            content_type = session.content.type.value if session.content.type else "reel"
            preferred_types[content_type] = preferred_types.get(content_type, 0) + 1
        
        if session.comprehension_score:
            comprehension_scores.append(session.comprehension_score)
        if session.focus_score:
            focus_scores.append(session.focus_score)
    
    # Calculate averages
    avg_concept_mastery = (
        sum(comprehension_scores) / len(comprehension_scores) 
        if comprehension_scores else 0.5
    )
    avg_focus = (
        sum(focus_scores) / len(focus_scores) 
        if focus_scores else 0.5
    )
    
    # Get concepts due for review (FSRS)
    concepts_due = await _get_concepts_due_for_review(db, user.id)
    
    # Sort preferred types by frequency
    preferred_content_types = sorted(
        preferred_types.items(), 
        key=lambda x: x[1], 
        reverse=True
    )
    preferred_content_types = [t[0] for t in preferred_content_types[:3]] or ["reel"]
    
    return {
        "cognitive_profile": cognitive_profile,
        "engagement_history": {
            "engaged_domains": list(engaged_domains),
            "preferred_content_types": preferred_content_types,
            "average_concept_mastery": avg_concept_mastery,
            "average_focus": avg_focus,
            "has_prerequisite_knowledge": len(engaged_domains) > 2,
            "concepts_due_for_review": concepts_due,
            "total_sessions": len(sessions),
            "xp": user.xp,
            "level": user.level,
            "streak": user.streak,
        }
    }


async def _get_concepts_due_for_review(db: AsyncSession, user_id: str) -> list:
    """Get concepts that need review according to FSRS schedule."""
    
    now = datetime.now(timezone.utc)
    
    stmt = (
        select(FlashCard)
        .where(
            (FlashCard.user_id == user_id) &
            ((FlashCard.due_date == None) | (FlashCard.due_date <= now))
        )
        .limit(10)
    )
    result = await db.execute(stmt)
    cards = result.scalars().all()
    
    concepts = []
    for card in cards:
        # Extract concept from card (stored in question/answer or concept_id)
        if card.concept_id:
            concepts.append(card.concept_id)
    
    return concepts


async def update_learning_streak(db: AsyncSession, user: User) -> None:
    """Update user's learning streak based on daily activity."""
    
    now = datetime.now(timezone.utc).date()
    yesterday = now - timedelta(days=1)
    
    # Check if user had activity today or yesterday
    today_stmt = (
        select(LearningSession)
        .where(LearningSession.user_id == user.id)
        .where(LearningSession.created_at >= datetime.combine(now, datetime.min.time()).replace(tzinfo=timezone.utc))
    )
    today_result = await db.execute(today_stmt)
    today_sessions = today_result.scalars().all()
    
    yesterday_stmt = (
        select(LearningSession)
        .where(LearningSession.user_id == user.id)
        .where(
            LearningSession.created_at >= datetime.combine(yesterday, datetime.min.time()).replace(tzinfo=timezone.utc),
            LearningSession.created_at < datetime.combine(now, datetime.min.time()).replace(tzinfo=timezone.utc),
        )
    )
    yesterday_result = await db.execute(yesterday_stmt)
    yesterday_sessions = yesterday_result.scalars().all()
    
    if today_sessions:
        # User is active today, maintain or increase streak
        if not yesterday_sessions:
            user.streak = 1  # Start new streak if no activity yesterday
        # else: keep existing streak (it will be incremented elsewhere)
    else:
        # No activity today
        if yesterday_sessions:
            # User was active yesterday, streak continues
            user.streak += 1
        else:
            # No activity today or yesterday, reset streak
            user.streak = 0
    
    user.last_active = datetime.now(timezone.utc)
    await db.commit()


async def calculate_session_xp(
    watch_time: int,
    comprehension_score: float,
    recall_score: float,
    quiz_correct_count: int,
    quiz_total_count: int,
) -> int:
    """
    Calculate XP earned from a learning session.
    
    Formula:
    base_xp = 10 + (watch_time / 60)  # 1 XP per minute
    comprehension_bonus = comprehension_score * 20
    retention_bonus = recall_score * 15
    quiz_bonus = (quiz_correct / quiz_total) * 25
    """
    
    base_xp = 10 + max(0, watch_time / 60)
    comprehension_bonus = max(0, comprehension_score * 20) if comprehension_score else 0
    retention_bonus = max(0, recall_score * 15) if recall_score else 0
    
    quiz_bonus = 0
    if quiz_total_count > 0:
        quiz_bonus = (quiz_correct_count / quiz_total_count) * 25
    
    total_xp = int(base_xp + comprehension_bonus + retention_bonus + quiz_bonus)
    return max(10, total_xp)  # Minimum 10 XP
