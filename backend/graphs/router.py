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
    """Return a mocked knowledge graph for the given topic."""
    nodes = [
        {"id": "1", "label": topic, "type": "root", "x": 0, "y": 0},
        {"id": "2", "label": f"Foundation of {topic}", "type": "concept", "x": -200, "y": 100},
        {"id": "3", "label": f"Core Principles", "type": "concept", "x": 0, "y": 150},
        {"id": "4", "label": f"Advanced {topic}", "type": "concept", "x": 200, "y": 100},
        {"id": "5", "label": f"Applications", "type": "concept", "x": -100, "y": 250},
        {"id": "6", "label": f"Best Practices", "type": "concept", "x": 100, "y": 250},
    ]
    edges = [
        {"source": "1", "target": "2"},
        {"source": "1", "target": "3"},
        {"source": "1", "target": "4"},
        {"source": "2", "target": "5"},
        {"source": "3", "target": "5"},
        {"source": "3", "target": "6"},
        {"source": "4", "target": "6"},
    ]
    return {"topic": topic, "nodes": nodes, "edges": edges}
