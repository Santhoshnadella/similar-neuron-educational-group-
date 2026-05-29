"""
Feed Service — AI-powered content ranking & personalization.
Implements KnowledgeVerse's competitive moat: cognitive + behavioral matching.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from db.models import Content, User, Follow, LearningSession, CognitiveProfile
from feed.schemas import FeedResponse, FeedItem


# ─── MOAT: Cognitive + Behavioral Matchmaking ─────────────────────

class MatchmakingEngine:
    """
    KnowledgeVerse's unfair advantage: matches content to cognitive + behavioral state.
    
    Data Points:
    - Cognitive: working_memory, processing_speed, attention_control, etc.
    - Behavioral: engagement patterns, time-on-task, quiz performance
    - Content: difficulty, learning_value, domain, prerequisites
    - Social: creator credibility, peer engagement
    - Temporal: forgetting curve phase, learning streak
    
    Match Score = 
      0.30 * cognitive_fit +
      0.25 * learning_value_fit +
      0.20 * engagement_potential +
      0.15 * social_proof +
      0.10 * spaced_repetition_urgency
    """

    @staticmethod
    def calculate_match_score(
        user_profile: Dict[str, Any],
        content: Content,
        engagement_history: Dict[str, Any],
    ) -> float:
        """Calculate how well content matches user's cognitive state."""
        
        # 1. Cognitive Fit (30%)
        cognitive_fit = MatchmakingEngine._cognitive_fit_score(
            user_profile, content.difficulty_level
        )
        
        # 2. Learning Value (25%)
        learning_value_fit = MatchmakingEngine._learning_value_score(
            user_profile, content, engagement_history
        )
        
        # 3. Engagement Potential (20%)
        engagement_potential = MatchmakingEngine._engagement_potential_score(
            user_profile, content, engagement_history
        )
        
        # 4. Social Proof (15%)
        social_proof = MatchmakingEngine._social_proof_score(content)
        
        # 5. Spaced Repetition Urgency (10%)
        sr_urgency = MatchmakingEngine._spaced_repetition_urgency(
            content.concepts, engagement_history
        )
        
        match_score = (
            0.30 * cognitive_fit +
            0.25 * learning_value_fit +
            0.20 * engagement_potential +
            0.15 * social_proof +
            0.10 * sr_urgency
        )
        
        return max(0.0, min(1.0, match_score))  # Clamp to [0, 1]

    @staticmethod
    def _cognitive_fit_score(user_profile: Dict[str, Any], content_difficulty: int) -> float:
        """Does content difficulty match user's cognitive processing power?"""
        # Normalize user cognitive index (1-10 scale to difficulty 1-10)
        user_cognitive_level = max(1, min(10, (user_profile.get("cognitive_index", 50) / 10)))
        
        # Distance from ideal difficulty
        distance = abs(content_difficulty - user_cognitive_level)
        
        # Score: max at distance=0, decreases with distance
        cognitive_fit = max(0.0, 1.0 - (distance / 4.0))
        return cognitive_fit

    @staticmethod
    def _learning_value_score(
        user_profile: Dict[str, Any],
        content: Content,
        engagement_history: Dict[str, Any],
    ) -> float:
        """Is this content aligned with user's learning objectives?"""
        learning_value = float(content.estimated_learning_value or 0.5)
        
        # Has user engaged with prerequisites? (bonus if yes)
        prerequisite_bonus = 0.1 if engagement_history.get("has_prerequisite_knowledge") else 0.0
        
        # Is this concept new or partially mastered? (bonus for learning new)
        concept_mastery = engagement_history.get("average_concept_mastery", 0.5)
        novelty_bonus = (1.0 - concept_mastery) * 0.2  # Up to +0.2 for new concepts
        
        return min(1.0, learning_value + prerequisite_bonus + novelty_bonus)

    @staticmethod
    def _engagement_potential_score(
        user_profile: Dict[str, Any],
        content: Content,
        engagement_history: Dict[str, Any],
    ) -> float:
        """Will user engage with this content based on past behavior?"""
        # Domain match
        user_engaged_domains = engagement_history.get("engaged_domains", [])
        domain_match = 1.0 if content.domain in user_engaged_domains else 0.5
        
        # Content type preference
        user_preferred_types = engagement_history.get("preferred_content_types", ["reel"])
        type_match = 1.0 if content.type.value in user_preferred_types else 0.7
        
        # Content retention in user's history
        content_retention = engagement_history.get(f"retention_in_{content.domain}", 0.5)
        
        return (domain_match * 0.4 + type_match * 0.3 + content_retention * 0.3)

    @staticmethod
    def _social_proof_score(content: Content) -> float:
        """Is this content trusted by the community?"""
        # Engagement score (0-1 scale)
        engagement = float(content.engagement_score or 0.0)
        
        # View-normalized engagement (1 like per 10 views is good)
        like_rate = content.like_count / max(1, content.view_count / 10)
        like_score = min(1.0, like_rate)
        
        # Decay by content age (older content deprioritized)
        age_days = (datetime.now(timezone.utc) - content.created_at).days
        age_decay = max(0.5, 1.0 - (age_days / 365.0) * 0.5)  # Min 0.5 after 1 year
        
        return (engagement * 0.5 + like_score * 0.3 + age_decay * 0.2)

    @staticmethod
    def _spaced_repetition_urgency(concepts: List[str], engagement_history: Dict[str, Any]) -> float:
        """Should this content be surfaced due to FSRS scheduling?"""
        if not concepts:
            return 0.5
        
        # Check how many concepts are due for review
        due_concepts = engagement_history.get("concepts_due_for_review", [])
        concepts_overlap = len(set(concepts) & set(due_concepts))
        
        urgency = min(1.0, concepts_overlap / len(concepts)) if concepts else 0.5
        return urgency


async def _get_user_analytics(db: AsyncSession, user: User) -> Dict[str, Any]:
    """Extract cognitive profile and engagement history for matchmaking."""
    
    cognitive_profile = {
        "working_memory": user.cognitive_profile.working_memory if user.cognitive_profile else 50.0,
        "processing_speed": user.cognitive_profile.processing_speed if user.cognitive_profile else 50.0,
        "attention_control": user.cognitive_profile.attention_control if user.cognitive_profile else 50.0,
        "spatial_reasoning": user.cognitive_profile.spatial_reasoning if user.cognitive_profile else 50.0,
        "creativity": user.cognitive_profile.creativity if user.cognitive_profile else 50.0,
        "cognitive_index": user.cognitive_profile.cognitive_index if user.cognitive_profile else 50.0,
    }
    
    # Get user's recent learning sessions
    stmt = select(LearningSession).where(LearningSession.user_id == user.id).order_by(desc(LearningSession.created_at)).limit(50)
    result = await db.execute(stmt)
    sessions = result.scalars().all()
    
    # Extract engagement history
    engaged_domains = set()
    preferred_types = {}
    avg_retention = {}
    concepts_due = []
    
    for session in sessions:
        if session.content:
            if session.content.domain:
                engaged_domains.add(session.content.domain)
            content_type = session.content.type.value if session.content.type else "reel"
            preferred_types[content_type] = preferred_types.get(content_type, 0) + 1
    
    # Sort preferred types by frequency
    preferred_content_types = sorted(preferred_types.items(), key=lambda x: x[1], reverse=True)
    preferred_content_types = [t[0] for t in preferred_content_types[:3]]
    
    avg_concept_mastery = 0.5  # Default
    if sessions:
        mastery_scores = [s.comprehension_score or 0.5 for s in sessions if s.comprehension_score]
        if mastery_scores:
            avg_concept_mastery = sum(mastery_scores) / len(mastery_scores)
    
    return {
        "cognitive_profile": cognitive_profile,
        "engagement_history": {
            "engaged_domains": list(engaged_domains),
            "preferred_content_types": preferred_content_types or ["reel"],
            "average_concept_mastery": avg_concept_mastery,
            "has_prerequisite_knowledge": len(engaged_domains) > 2,
            "concepts_due_for_review": concepts_due,
        }
    }


async def get_personalized_feed(
    db: AsyncSession,
    current_user: User,
    page: int = 1,
    limit: int = 10,
) -> FeedResponse:
    """
    Get AI-ranked personalized feed using matchmaking engine.
    
    Algorithm:
    1. Fetch candidate content (published, not creator's own)
    2. Calculate match score for each piece
    3. Sort by match score + freshness
    4. Apply pagination
    """
    
    # Get user analytics (cognitive profile, engagement history)
    user_analytics = await _get_user_analytics(db, current_user)
    
    # Fetch published content (excluding user's own)
    stmt = (
        select(Content)
        .where(
            and_(
                Content.is_published == True,
                Content.creator_id != current_user.id,
            )
        )
        .order_by(desc(Content.created_at))
        .limit(100)  # Fetch top 100 for ranking
    )
    result = await db.execute(stmt)
    candidate_content = result.scalars().all()
    
    # Score each piece and sort
    scored_content = []
    engine = MatchmakingEngine()
    
    for content in candidate_content:
        match_score = engine.calculate_match_score(
            user_profile=user_analytics["cognitive_profile"],
            content=content,
            engagement_history=user_analytics["engagement_history"],
        )
        scored_content.append((content, match_score))
    
    # Sort by score descending, then by recency
    scored_content.sort(
        key=lambda x: (x[1], x[0].created_at),
        reverse=True,
    )
    
    # Apply pagination
    start_idx = (page - 1) * limit
    paginated_content = scored_content[start_idx : start_idx + limit]
    
    # Convert to response schema
    items = [
        FeedItem.model_validate(content)
        for content, _ in paginated_content
    ]
    
    return FeedResponse(items=items, total=len(scored_content))


async def get_trending_feed(
    db: AsyncSession,
    page: int = 1,
    limit: int = 10,
    domain: Optional[str] = None,
) -> FeedResponse:
    """Get trending educational content across platform."""
    
    stmt = select(Content).where(Content.is_published == True)
    
    if domain:
        stmt = stmt.where(Content.domain == domain)
    
    # Trending: recent + high engagement
    stmt = stmt.order_by(
        desc(Content.engagement_score),
        desc(Content.like_count),
        desc(Content.created_at),
    ).limit(limit).offset((page - 1) * limit)
    
    result = await db.execute(stmt)
    items = result.scalars().all()
    
    return FeedResponse(
        items=[FeedItem.model_validate(c) for c in items],
        total=len(items),
    )


async def get_following_feed(
    db: AsyncSession,
    current_user: User,
    page: int = 1,
    limit: int = 10,
) -> FeedResponse:
    """Get feed from creators user follows."""
    
    # Get list of users being followed
    stmt = select(Follow).where(Follow.follower_id == current_user.id)
    result = await db.execute(stmt)
    follows = result.scalars().all()
    
    following_ids = [f.following_id for f in follows]
    
    if not following_ids:
        return FeedResponse(items=[], total=0)
    
    # Fetch content from followed creators
    stmt = (
        select(Content)
        .where(
            and_(
                Content.creator_id.in_(following_ids),
                Content.is_published == True,
            )
        )
        .order_by(desc(Content.created_at))
        .limit(limit)
        .offset((page - 1) * limit)
    )
    
    result = await db.execute(stmt)
    items = result.scalars().all()
    
    return FeedResponse(
        items=[FeedItem.model_validate(c) for c in items],
        total=len(items),
    )
