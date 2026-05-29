from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from db.database import get_db
from db.models import User, LearningSession, FlashCard
from auth.dependencies import get_current_user
from learning.analytics import calculate_session_xp, update_learning_streak, get_user_analytics
from learning.fsrs import FSRSScheduler, review_flashcard, get_due_cards

router = APIRouter()


@router.post("/session/start")
async def start_session(
    content_id: str = Body(...),
    mode: str = Body("scroll"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a new learning session."""
    session = LearningSession(
        user_id=current_user.id,
        content_id=content_id,
        mode=mode,
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)
    return {"session_id": session.id, "started_at": session.started_at}


@router.post("/session/end")
async def end_session(
    session_id: str = Body(...),
    watch_time: int = Body(0),
    comprehension_score: float = Body(None),
    recall_score: float = Body(None),
    focus_score: float = Body(None),
    quiz_correct: int = Body(0),
    quiz_total: int = Body(0),
    quiz_answers: list = Body(default=[]),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """End learning session and calculate rewards (XP, streaks, cognitive updates)."""
    
    result = await db.execute(select(LearningSession).where(LearningSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.ended_at = datetime.now(timezone.utc)
    session.watch_time = watch_time
    session.comprehension_score = comprehension_score
    session.recall_score = recall_score
    session.focus_score = focus_score
    session.quiz_answers = quiz_answers

    # Calculate XP using analytics engine
    xp_earned = calculate_session_xp(
        watch_time=watch_time,
        comprehension_score=comprehension_score or 0.0,
        recall_score=recall_score or 0.0,
        quiz_correct_count=quiz_correct,
        quiz_total_count=quiz_total,
    )
    
    session.xp_earned = xp_earned

    # Update user XP and level
    current_user.xp += xp_earned
    current_user.level = max(1, current_user.xp // 1000)
    
    # Update learning streak
    await update_learning_streak(db, current_user)

    # Update cognitive profile from session (AI brain profiling)
    from content.service import update_cognitive_profile_from_session
    await update_cognitive_profile_from_session(db, current_user, session)

    await db.commit()
    
    return {
        "session_id": session_id,
        "xp_earned": xp_earned,
        "total_xp": current_user.xp,
        "level": current_user.level,
        "streak": current_user.streak,
    }


@router.get("/stats")
async def get_learning_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's comprehensive learning statistics."""
    
    analytics = await get_user_analytics(db, current_user)
    
    # Get flashcard stats
    from learning.fsrs import get_card_stats
    card_stats = await get_card_stats(db, current_user.id)
    
    return {
        "user": {
            "xp": current_user.xp,
            "level": current_user.level,
            "streak": current_user.streak,
            "learning_level": current_user.learning_level.value if current_user.learning_level else "beginner",
        },
        "cognitive_profile": analytics["cognitive_profile"],
        "engagement": analytics["engagement_history"],
        "flashcard_stats": card_stats,
    }


@router.get("/flashcards/due")
async def get_due_flashcards(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 10,
):
    """Get flashcards due for FSRS review."""
    
    cards = await get_due_cards(db, current_user.id, limit)
    
    return {
        "cards": [
            {
                "id": c.id,
                "question": c.question,
                "concept_id": c.concept_id,
                "stability": c.stability,
                "difficulty": c.difficulty,
                "review_count": c.review_count,
            }
            for c in cards
        ],
        "total": len(cards),
    }


@router.post("/flashcards/{card_id}/review")
async def review_flashcard_endpoint(
    card_id: str,
    quality: int = Body(..., ge=0, le=5),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Review a flashcard and update FSRS schedule.
    
    quality: 0-5 scale
        0: Complete blackout
        1: Incorrect (hard to recall)
        2: Incorrect but familiar  
        3: Correct after thought
        4: Correct with little effort
        5: Perfect recall
    """
    
    result = await db.execute(select(FlashCard).where(FlashCard.id == card_id))
    card = result.scalar_one_or_none()
    
    if not card or card.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Update card with FSRS
    updated_card = await review_flashcard(db, card, quality)
    
    # Award XP for review
    xp_reward = 5 + quality * 5  # 5-30 XP depending on quality
    current_user.xp += xp_reward
    await db.commit()
    
    return {
        "card_id": card_id,
        "new_stability": updated_card.stability,
        "new_difficulty": updated_card.difficulty,
        "next_review": updated_card.due_date.isoformat(),
        "xp_earned": xp_reward,
    }


@router.get("/pathway/{pathway_id}")
async def get_learning_pathway(
    pathway_id: str,
    current_user: User = Depends(get_current_user),
):
    """Return a learning pathway from curriculum agent."""
    from agents.curriculum_agent import generate_roadmap
    # Treat pathway_id as the topic for this demo
    roadmap = await generate_roadmap(
        topic=pathway_id,
        level=current_user.learning_level.value if current_user.learning_level else "beginner",
        goal=f"Master {pathway_id}"
    )
    return {
        "id": pathway_id,
        "title": roadmap.title,
        "progress": 0.0,
        "nodes": roadmap.model_dump().get("nodes", []),
    }


@router.post("/session/deep-work")
async def start_deep_work(
    duration_minutes: int = Body(60),
    current_user: User = Depends(get_current_user),
):
    """Phase 3 Deep Work: Start a highly focused, gamified session."""
    return {
        "status": "active",
        "duration": duration_minutes,
        "xp_multiplier": 2.0,
        "message": "Deep work mode activated. Distractions blocked."
    }
