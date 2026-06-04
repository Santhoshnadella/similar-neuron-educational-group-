from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.database import get_db
from db.models import Guild, Debate

router = APIRouter()

@router.get("/guilds")
async def get_guilds(db: AsyncSession = Depends(get_db)):
    """Phase 3 Gamification: Get Learning Guilds from DB"""
    result = await db.execute(select(Guild).limit(20))
    guilds = result.scalars().all()
    return {"guilds": [{"id": g.id, "name": g.name, "description": g.description} for g in guilds]}

@router.get("/debates")
async def get_debates(db: AsyncSession = Depends(get_db)):
    """Phase 3 Gamification: Get Community Debates from DB"""
    result = await db.execute(select(Debate).limit(20))
    debates = result.scalars().all()
    return {"debates": [{"id": d.id, "topic": d.topic, "status": d.status} for d in debates]}

@router.post("/guilds/{guild_id}/join")
async def join_guild(
    guild_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Phase 3 Gamification: Join a guild"""
    # Just returning success for now as we don't have UserGuild mapping model yet
    return {"message": f"Successfully joined guild {guild_id}"}

from pydantic import BaseModel
from agents.ai_client import ai_client

class ArgumentRequest(BaseModel):
    argument: str

@router.post("/debates/{debate_id}/argue")
async def submit_argument(
    debate_id: str,
    request: ArgumentRequest,
    db: AsyncSession = Depends(get_db),
):
    """Phase 3 Gamification: Submit an argument to a debate."""
    prompt = f"Evaluate this debate argument for logical strength. Detect any fallacies. Keep feedback to exactly 1 concise sentence. Argument: {request.argument}"
    
    try:
        feedback = await ai_client.chat([{"role": "user", "content": prompt}], max_tokens=150)
    except Exception:
        feedback = "Unable to process AI evaluation at this time."
        
    xp_awarded = min(50, len(request.argument) // 2)
    return {
        "message": "Argument submitted",
        "xp_awarded": xp_awarded,
        "ai_feedback": feedback
    }
