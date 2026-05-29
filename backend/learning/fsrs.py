"""
FSRS (Free Spaced Repetition Schedule) Engine
Implementation based on the FSRS algorithm for optimal review scheduling.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import math

from db.models import FlashCard, Concept


class FSRSScheduler:
    """
    Free Spaced Repetition Schedule algorithm.
    Calculates optimal review timing to minimize forgetting while maximizing retention.
    """
    
    # FSRS parameters (can be tuned)
    INITIAL_STABILITY = 1.0  # Time period (days) before card is forgotten from scratch
    INITIAL_DIFFICULTY = 0.3  # Probability of forgetting on first review
    MAX_STABILITY_GROWTH = 36500  # Max stability (100 years)
    
    @staticmethod
    def calculate_next_review(
        current_stability: float,
        current_difficulty: float,
        quality: int,  # 0-5 scale: 0=complete blackout, 5=perfect recall
        review_count: int,
    ) -> tuple:
        """
        Calculate updated stability and difficulty after review.
        
        quality: Confidence level of response
            0: complete blackout (forget immediately)
            1: incorrect (hard to recall)
            2: incorrect but familiar
            3: correct after some thought
            4: correct with little effort
            5: perfect recall
        
        Returns: (new_stability, new_difficulty, next_review_days)
        """
        
        # Calculate forgetting probability and grade quality
        decay = -0.5
        grade_weights = [0, 0.3, 0.6, 0.8, 0.9, 1.0]
        grade = grade_weights[min(quality, 5)]
        
        # Update difficulty (hard to forget if we're doing well)
        new_difficulty = (
            current_difficulty + 
            (8 - 9 * grade) * 0.02
        )
        new_difficulty = max(0.0, min(10.0, new_difficulty))
        
        # Forgetting function
        if quality < 2:  # Forgotten
            new_stability = 1.0  # Reset to initial
        else:
            # Update stability (increases with each correct review)
            factor = (1.0 - new_difficulty / 10.0) * grade
            new_stability = current_stability * (1.0 + factor)
            new_stability = min(new_stability, FSRSScheduler.MAX_STABILITY_GROWTH)
        
        # Calculate next review interval (in days)
        # Use exponential decay: forget when stability expires
        next_interval = new_stability
        
        return new_stability, new_difficulty, next_interval
    
    @staticmethod
    def get_next_review_date(stability: float) -> datetime:
        """Get datetime when card should next be reviewed."""
        now = datetime.now(timezone.utc)
        next_date = now + timedelta(days=stability)
        return next_date


async def create_flashcard(
    db: AsyncSession,
    user_id: str,
    concept_id: Optional[str],
    question: str,
    answer: str,
) -> FlashCard:
    """Create a new flashcard for a concept."""
    
    card = FlashCard(
        user_id=user_id,
        concept_id=concept_id,
        question=question,
        answer=answer,
        stability=FSRSScheduler.INITIAL_STABILITY,
        difficulty=FSRSScheduler.INITIAL_DIFFICULTY,
        due_date=datetime.now(timezone.utc),  # Ready for immediate review
        review_count=0,
    )
    
    db.add(card)
    await db.commit()
    return card


async def review_flashcard(
    db: AsyncSession,
    card: FlashCard,
    quality: int,  # 0-5 confidence score
) -> FlashCard:
    """
    Record a flashcard review and update FSRS schedule.
    
    quality scale:
        0: Complete blackout
        1: Incorrect (hard to recall)
        2: Incorrect but familiar
        3: Correct after thought
        4: Correct with little effort
        5: Perfect recall
    """
    
    # Calculate new FSRS values
    new_stability, new_difficulty, next_interval = FSRSScheduler.calculate_next_review(
        card.stability,
        card.difficulty,
        quality,
        card.review_count,
    )
    
    # Update card
    card.stability = new_stability
    card.difficulty = new_difficulty
    card.due_date = FSRSScheduler.get_next_review_date(next_interval)
    card.last_review = datetime.now(timezone.utc)
    card.review_count += 1
    
    await db.commit()
    return card


async def get_due_cards(
    db: AsyncSession,
    user_id: str,
    limit: int = 10,
) -> list:
    """Get flashcards due for review (FSRS scheduling)."""
    
    now = datetime.now(timezone.utc)
    
    stmt = (
        select(FlashCard)
        .where(
            (FlashCard.user_id == user_id) &
            ((FlashCard.due_date == None) | (FlashCard.due_date <= now))
        )
        .order_by(FlashCard.due_date)
        .limit(limit)
    )
    
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_card_stats(db: AsyncSession, user_id: str) -> dict:
    """Get user's flashcard statistics."""
    
    now = datetime.now(timezone.utc)
    
    # Total cards
    total_stmt = select(FlashCard).where(FlashCard.user_id == user_id)
    total_result = await db.execute(total_stmt)
    total_cards = len(total_result.scalars().all())
    
    # Due cards
    due_stmt = (
        select(FlashCard)
        .where(
            (FlashCard.user_id == user_id) &
            ((FlashCard.due_date == None) | (FlashCard.due_date <= now))
        )
    )
    due_result = await db.execute(due_stmt)
    due_cards = len(due_result.scalars().all())
    
    # Average stability and difficulty
    cards_stmt = select(FlashCard).where(FlashCard.user_id == user_id)
    cards_result = await db.execute(cards_stmt)
    cards = cards_result.scalars().all()
    
    avg_stability = sum(c.stability for c in cards) / len(cards) if cards else 0
    avg_difficulty = sum(c.difficulty for c in cards) / len(cards) if cards else 0
    avg_reviews = sum(c.review_count for c in cards) / len(cards) if cards else 0
    
    return {
        "total_cards": total_cards,
        "due_cards": due_cards,
        "average_stability": avg_stability,
        "average_difficulty": avg_difficulty,
        "average_reviews": avg_reviews,
    }
