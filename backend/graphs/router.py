from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.database import get_db
from db.models import Concept

router = APIRouter()


@router.get("/")
async def list_concepts(domain: str = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Concept)
    if domain:
        stmt = stmt.where(Concept.domain == domain)
    result = await db.execute(stmt)
    concepts = result.scalars().all()
    return {"concepts": [{"id": c.id, "name": c.name, "domain": c.domain, "difficulty": c.difficulty} for c in concepts]}


@router.get("/map/{topic}")
async def get_concept_map(topic: str):
    """Return a real knowledge graph neighborhood for the given topic."""
    from graphs.service import get_subgraph_for_topic
    return get_subgraph_for_topic(topic, radius=2)
