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
