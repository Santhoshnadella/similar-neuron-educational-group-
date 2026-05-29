from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime


class FeedItem(BaseModel):
    id: str
    title: str
    type: str
    domain: Optional[str] = None
    body: Optional[str] = None
    media_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    difficulty_level: int
    estimated_learning_value: float
    engagement_score: float
    view_count: int
    like_count: int
    concepts: List[Any] = []
    quiz_questions: List[Any] = []
    learning_objective: Optional[str] = None
    feynman_explanation: Optional[str] = None
    creator_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class FeedResponse(BaseModel):
    items: List[FeedItem]
    page: int
    limit: int
    total: int
