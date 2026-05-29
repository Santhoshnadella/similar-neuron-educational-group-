"""All SQLAlchemy models for KnowledgeVerse."""
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime,
    ForeignKey, JSON, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


# ─── Enums ───────────────────────────────────────────────────────

class LearningLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class ContentType(str, enum.Enum):
    REEL = "reel"
    ARTICLE = "article"
    COURSE = "course"
    QUIZ = "quiz"
    PROJECT = "project"


class TutorMode(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    EXPERT = "expert"
    FEYNMAN = "feynman"
    STORY = "story"
    ANALOGY = "analogy"
    SOCRATIC = "socratic"


# ─── Cognitive Profile ───────────────────────────────────────────

class CognitiveProfile(Base):
    __tablename__ = "cognitive_profiles"

    id = Column(String, primary_key=True, default=gen_uuid)
    working_memory = Column(Float, default=50.0)
    processing_speed = Column(Float, default=50.0)
    attention_control = Column(Float, default=50.0)
    spatial_reasoning = Column(Float, default=50.0)
    creativity = Column(Float, default=50.0)
    emotional_regulation = Column(Float, default=50.0)
    verbal_intelligence = Column(Float, default=50.0)
    cognitive_index = Column(Float, default=50.0)
    last_assessed = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="cognitive_profile", uselist=False)


# ─── User ─────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    cognitive_profile_id = Column(String, ForeignKey("cognitive_profiles.id"), nullable=True)
    learning_level = Column(SAEnum(LearningLevel), default=LearningLevel.BEGINNER)
    streak = Column(Integer, default=0)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    focus_score = Column(Float, default=50.0)
    curiosity_score = Column(Float, default=50.0)
    is_active = Column(Boolean, default=True)
    is_creator = Column(Boolean, default=False)
    oauth_provider = Column(String(50), nullable=True)
    oauth_id = Column(String(255), nullable=True)
    last_active = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    cognitive_profile = relationship("CognitiveProfile", back_populates="user", lazy="selectin")
    content = relationship("Content", back_populates="creator", foreign_keys="Content.creator_id")
    learning_sessions = relationship("LearningSession", back_populates="user")
    follows = relationship("Follow", foreign_keys="Follow.follower_id", back_populates="follower")
    followers = relationship("Follow", foreign_keys="Follow.following_id", back_populates="following")


# ─── Follow ───────────────────────────────────────────────────────

class Follow(Base):
    __tablename__ = "follows"

    id = Column(String, primary_key=True, default=gen_uuid)
    follower_id = Column(String, ForeignKey("users.id"), nullable=False)
    following_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    follower = relationship("User", foreign_keys=[follower_id], back_populates="follows")
    following = relationship("User", foreign_keys=[following_id], back_populates="followers")


# ─── Content ──────────────────────────────────────────────────────

class Content(Base):
    __tablename__ = "content"

    id = Column(String, primary_key=True, default=gen_uuid)
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    type = Column(SAEnum(ContentType), default=ContentType.REEL)
    domain = Column(String(200), nullable=True)
    body = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)
    media_url = Column(String(1000), nullable=True)
    thumbnail_url = Column(String(1000), nullable=True)
    difficulty_level = Column(Integer, default=1)  # 1-10
    estimated_learning_value = Column(Float, default=0.5)
    retention_score = Column(Float, default=0.5)
    engagement_score = Column(Float, default=0.0)
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    concepts = Column(JSON, default=list)
    prerequisites = Column(JSON, default=list)
    quiz_questions = Column(JSON, default=list)
    learning_objective = Column(Text, nullable=True)
    feynman_explanation = Column(Text, nullable=True)
    references = Column(JSON, default=list)
    embedding_id = Column(String(255), nullable=True)  # Qdrant point ID
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    creator = relationship("User", back_populates="content", foreign_keys=[creator_id])
    learning_sessions = relationship("LearningSession", back_populates="content")


# ─── Concept (Knowledge Graph Node) ──────────────────────────────

class Concept(Base):
    __tablename__ = "concepts"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(500), unique=True, nullable=False, index=True)
    domain = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    parent_concept = Column(String, ForeignKey("concepts.id"), nullable=True)
    prerequisites = Column(JSON, default=list)
    mastery_weight = Column(Float, default=1.0)
    difficulty = Column(Integer, default=5)
    is_core = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─── Learning Session ────────────────────────────────────────────

class LearningSession(Base):
    __tablename__ = "learning_sessions"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    content_id = Column(String, ForeignKey("content.id"), nullable=True)
    mode = Column(String(50), default="scroll")
    watch_time = Column(Integer, default=0)  # seconds
    comprehension_score = Column(Float, nullable=True)
    recall_score = Column(Float, nullable=True)
    focus_score = Column(Float, nullable=True)
    quiz_answers = Column(JSON, default=list)
    xp_earned = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="learning_sessions")
    content = relationship("Content", back_populates="learning_sessions")


# ─── Spaced Repetition Card ──────────────────────────────────────

class FlashCard(Base):
    __tablename__ = "flashcards"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    concept_id = Column(String, ForeignKey("concepts.id"), nullable=True)
    content_id = Column(String, ForeignKey("content.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    # FSRS fields
    stability = Column(Float, default=1.0)
    difficulty = Column(Float, default=0.3)
    due_date = Column(DateTime(timezone=True), nullable=True)
    last_review = Column(DateTime(timezone=True), nullable=True)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─── Achievement ─────────────────────────────────────────────────

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    xp_reward = Column(Integer, default=0)
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())
