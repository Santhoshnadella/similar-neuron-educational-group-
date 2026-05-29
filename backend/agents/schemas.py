from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class TutorRequest(BaseModel):
    message: str
    mode: str = "beginner"  # beginner|intermediate|expert|feynman|story|analogy|socratic
    topic: Optional[str] = None
    history: List[ChatMessage] = []


class TutorResponse(BaseModel):
    reply: str
    mode: str
    follow_up_questions: List[str] = []
    related_concepts: List[str] = []


class RoadmapRequest(BaseModel):
    topic: str
    level: Optional[str] = None  # beginner|intermediate|advanced
    goal: Optional[str] = None


class RoadmapNode(BaseModel):
    id: str
    title: str
    description: str
    difficulty: int
    estimated_hours: float
    prerequisites: List[str] = []
    resources: List[str] = []
    is_core: bool = True


class RoadmapResponse(BaseModel):
    topic: str
    level: str
    nodes: List[RoadmapNode]
    estimated_total_hours: float
    pareto_path: List[str]  # 20% concepts that give 80% knowledge


class QuizRequest(BaseModel):
    topic: str
    difficulty: Optional[str] = None
    count: int = 5


class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_index: int
    explanation: str
    concept: str


class QuizResponse(BaseModel):
    topic: str
    questions: List[QuizQuestion]


class ExplainRequest(BaseModel):
    concept: str
    mode: Optional[str] = "feynman"  # feynman|eli5|analogy|story|technical
    context: Optional[str] = None


class ExplainResponse(BaseModel):
    concept: str
    mode: str
    explanation: str
    analogy: Optional[str] = None
    key_insights: List[str] = []
    common_misconceptions: List[str] = []
