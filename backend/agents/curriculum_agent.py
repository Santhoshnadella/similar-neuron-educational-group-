"""
Curriculum Agent — Generates personalized learning roadmaps.
Uses Pareto principle: identify the 20% of concepts that give 80% of knowledge.
"""
from typing import Optional
from agents.schemas import RoadmapResponse, RoadmapNode
from config import settings
import uuid


MOCK_ROADMAPS = {
    "default": lambda topic, level: RoadmapResponse(
        topic=topic,
        level=level,
        nodes=[
            RoadmapNode(
                id=str(uuid.uuid4()),
                title=f"Foundations of {topic}",
                description=f"Core principles and mental models for {topic}",
                difficulty=2,
                estimated_hours=3.0,
                prerequisites=[],
                resources=[f"Introduction to {topic} — KnowledgeVerse Feed"],
                is_core=True,
            ),
            RoadmapNode(
                id=str(uuid.uuid4()),
                title=f"Key Concepts in {topic}",
                description=f"The essential building blocks you must master",
                difficulty=4,
                estimated_hours=5.0,
                prerequisites=["Foundations"],
                resources=[f"{topic} Deep Dive — KnowledgeVerse Course"],
                is_core=True,
            ),
            RoadmapNode(
                id=str(uuid.uuid4()),
                title=f"Practical Application of {topic}",
                description=f"Hands-on projects to solidify understanding",
                difficulty=6,
                estimated_hours=8.0,
                prerequisites=["Key Concepts"],
                resources=[f"{topic} Projects — Creator Studio"],
                is_core=True,
            ),
            RoadmapNode(
                id=str(uuid.uuid4()),
                title=f"Advanced {topic}",
                description=f"Edge cases, optimizations, and expert-level nuances",
                difficulty=8,
                estimated_hours=10.0,
                prerequisites=["Practical Application"],
                resources=[f"Expert {topic} — KnowledgeVerse Deep Work Mode"],
                is_core=False,
            ),
            RoadmapNode(
                id=str(uuid.uuid4()),
                title=f"{topic} in the Real World",
                description=f"Industry applications, case studies, and career paths",
                difficulty=7,
                estimated_hours=6.0,
                prerequisites=["Practical Application"],
                resources=[f"{topic} Industry Insights — Community Debates"],
                is_core=False,
            ),
        ],
        estimated_total_hours=32.0,
        pareto_path=["Foundations", "Key Concepts", "Practical Application"],
    )
}


async def generate_roadmap(topic: str, level: str, goal: Optional[str]) -> RoadmapResponse:
    """Generate a learning roadmap for the given topic using Gemma 4."""
    from agents.lm_studio import lm_studio
    import json
    
    if await lm_studio.is_available():
        try:
            goal_str = f" Goal: {goal}." if goal else ""
            prompt = f"""Create a learning roadmap for "{topic}" at {level} level.{goal_str}

Apply the Pareto principle — identify the 20% of concepts giving 80% value.

Return JSON: {{
  "topic": str,
  "level": str,
  "nodes": [{{
    "id": uuid,
    "title": str,
    "description": str,
    "difficulty": 1-10,
    "estimated_hours": float,
    "prerequisites": [title strings],
    "resources": [str],
    "is_core": bool
  }}],
  "estimated_total_hours": float,
  "pareto_path": [title strings of the 20% core nodes]
}}

Generate 5-8 nodes. Return only valid JSON."""
            
            messages = [{"role": "system", "content": "You are an expert curriculum designer. Return only valid JSON."}, {"role": "user", "content": prompt}]
            raw = await lm_studio.chat(messages=messages, temperature=0.4, max_tokens=1024)
            
            raw = raw.strip()
            if "```" in raw:
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]

            data = json.loads(raw)
            return RoadmapResponse(**data)
        except Exception:
            pass

    return MOCK_ROADMAPS["default"](topic, level)
