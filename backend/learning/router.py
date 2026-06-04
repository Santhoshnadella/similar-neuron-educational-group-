from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from db.database import get_db
from db.models import User, LearningSession, FlashCard, Content
from db.vector import vector_db
from auth.dependencies import get_current_user
from learning.analytics import calculate_session_xp, update_learning_streak, get_user_analytics
from learning.fsrs import FSRSScheduler, review_flashcard, get_due_cards

router = APIRouter()


@router.get("/search")
async def search_content(
    q: str,
    db: AsyncSession = Depends(get_db)
):
    """Phase 3: Semantic Vector Search"""
    results = vector_db.search(q, limit=5)
    
    if not results:
        return {"results": []}
        
    # Get the content metadata from the DB
    content_ids = [r["content_id"] for r in results]
    stmt = select(Content).where(Content.id.in_(content_ids))
    db_results = await db.execute(stmt)
    content_items = db_results.scalars().all()
    
    # Map back to scores
    final_results = []
    for item in content_items:
        score = next((r["score"] for r in results if r["content_id"] == item.id), 0)
        final_results.append({
            "id": item.id,
            "title": item.title,
            "type": item.type,
            "domain": item.domain,
            "score": score
        })
        
    final_results.sort(key=lambda x: x["score"], reverse=True)
    return {"results": final_results}

from pydantic import BaseModel
from agents.ai_client import ai_client

class ContentUploadRequest(BaseModel):
    title: str
    body: str
    domain: str

@router.post("/content")
async def upload_content(
    request: ContentUploadRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Phase 3: Creator Studio Ingestion Pipeline"""
    from db.models import Concept
    
    # 1. AI Extraction (Concepts)
    prompt = f"Extract exactly 3 key educational concepts from this text. Return them as a comma-separated list of short phrases. Text: {request.body[:1000]}"
    try:
        concepts_str = await ai_client.chat([{"role": "user", "content": prompt}], max_tokens=100)
        concept_names = [c.strip() for c in concepts_str.split(",") if c.strip()]
    except Exception:
        concept_names = ["General Knowledge"]
        
    # 2. AI Extraction (FlashCards)
    qa_prompt = f"Create 1 highly specific Q&A flashcard based on this text. Format: Q: [question] | A: [answer]. Text: {request.body[:1000]}"
    try:
        qa_str = await ai_client.chat([{"role": "user", "content": qa_prompt}], max_tokens=150)
        parts = qa_str.split("|")
        q = parts[0].replace("Q:", "").strip() if len(parts) > 1 else "What is the main topic?"
        a = parts[1].replace("A:", "").strip() if len(parts) > 1 else "Refer to the text."
    except Exception:
        q = "What is the main concept discussed?"
        a = "Refer to the source material."

    # 3. Save Concepts to DB (simplified for now)
    concept_list = []
    for name in concept_names:
        result = await db.execute(select(Concept).where(Concept.name == name))
        concept = result.scalar_one_or_none()
        if not concept:
            concept = Concept(name=name, domain=request.domain)
            db.add(concept)
        concept_list.append(name)
        
    await db.flush()

    # 4. Save Content
    content = Content(
        title=request.title,
        body=request.body,
        domain=request.domain,
        creator_id=current_user.id,
        concepts=concept_list
    )
    db.add(content)
    await db.flush()
    
    # 5. Embed in Qdrant
    point_id = vector_db.add_content(content.id, request.body)
    content.embedding_id = point_id
    
    # 6. Save FlashCard
    card = FlashCard(
        user_id=current_user.id,
        content_id=content.id,
        question=q,
        answer=a
    )
    db.add(card)
    await db.commit()
    
    return {"message": "Content ingested, analyzed, and embedded successfully.", "content_id": content.id}


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

    # Event-Driven Achievements
    from users.achievements import check_and_unlock_achievements
    await check_and_unlock_achievements(db, current_user, "session_ended")

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
    topic_id: str = Body(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Phase 3 Deep Work: Start a highly focused, gamified session."""
    session = LearningSession(
        user_id=current_user.id,
        content_id=topic_id,
        mode="deep_work",
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)
    
    return {
        "status": "active",
        "session_id": session.id,
        "duration": duration_minutes,
        "xp_multiplier": 2.0,
        "message": "Deep work mode activated. Distractions blocked."
    }

@router.post("/games/score")
async def submit_game_score(
    game_type: str = Body(...),
    score: float = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Phase 3: Submit cognitive game score and update profile natively."""
    from db.models import CognitiveProfile
    
    result = await db.execute(select(CognitiveProfile).where(CognitiveProfile.id == current_user.cognitive_profile_id))
    profile = result.scalar_one_or_none()
    
    if not profile:
        profile = CognitiveProfile()
        db.add(profile)
        await db.flush()
        current_user.cognitive_profile_id = profile.id
    
    if game_type == "n-back":
        profile.working_memory = (profile.working_memory * 0.8) + (score * 0.2)
    elif game_type == "pattern":
        profile.spatial_reasoning = (profile.spatial_reasoning * 0.8) + (score * 0.2)
        
    profile.cognitive_index = (profile.working_memory + profile.processing_speed + profile.spatial_reasoning) / 3.0
    
    xp_earned = int(score / 5)
    current_user.xp += xp_earned
    
    # Event-Driven Achievements
    from users.achievements import check_and_unlock_achievements
    await check_and_unlock_achievements(db, current_user, "game_completed")

    await db.commit()
    
    return {
        "message": "Score submitted",
        "new_cognitive_index": profile.cognitive_index,
        "xp_earned": xp_earned
    }

@router.get("/skills/tree")
async def get_skills_tree(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Phase 3: Get gamified skill tree from actual Database entities."""
    from db.models import Concept, Achievement
    
    # Query Knowledge Graph Nodes
    result = await db.execute(select(Concept).limit(50))
    concepts = result.scalars().all()
    
    # Query Unlocked Achievements
    ach_result = await db.execute(select(Achievement).where(Achievement.user_id == current_user.id))
    achievements = ach_result.scalars().all()
    
    return {
        "nodes": [
            {
                "id": c.id,
                "name": c.name,
                "domain": c.domain,
                "difficulty": c.difficulty,
                "is_core": c.is_core,
            } for c in concepts
        ],
        "achievements": [
            {
                "id": a.id,
                "name": a.name,
                "description": a.description,
                "icon": a.icon
            } for a in achievements
        ]
    }
