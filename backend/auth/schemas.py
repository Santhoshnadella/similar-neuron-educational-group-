from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class OAuthRequest(BaseModel):
    provider: str  # "google" | "github"
    access_token: str


class CognitiveProfileResponse(BaseModel):
    id: str
    working_memory: float
    processing_speed: float
    attention_control: float
    spatial_reasoning: float
    creativity: float
    emotional_regulation: float
    cognitive_index: float

    model_config = {"from_attributes": True}


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    learning_level: str
    streak: int
    xp: int
    level: int
    focus_score: float
    curiosity_score: float
    is_creator: bool
    cognitive_profile: Optional[CognitiveProfileResponse] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
