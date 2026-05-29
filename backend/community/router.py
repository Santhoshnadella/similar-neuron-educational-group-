from fastapi import APIRouter

router = APIRouter()

@router.get("/guilds")
async def get_guilds():
    """Phase 3 Gamification: Learning Guilds"""
    return {"guilds": [{"id": 1, "name": "AI Explorers"}, {"id": 2, "name": "Neuroscience Nerds"}]}

@router.get("/debates")
async def get_debates():
    """Phase 3 Gamification: Community Debates"""
    return {"debates": [{"id": 1, "topic": "Is AGI near?", "status": "active"}]}
