from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List
from db.database import get_db
from db.models import User
from auth.dependencies import get_current_user
from agents import tutor_agent, curriculum_agent
from agents.schemas import (
    TutorRequest, TutorResponse,
    RoadmapRequest, RoadmapResponse,
    QuizRequest, QuizResponse,
    ExplainRequest, ExplainResponse,
    ChatMessage,
)
import json

router = APIRouter()


@router.post("/tutor", response_model=TutorResponse)
async def ai_tutor(
    request: TutorRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Multi-mode AI tutor — Beginner, Feynman, Story, Analogy, Socratic."""
    response = await tutor_agent.respond(
        message=request.message,
        mode=request.mode,
        topic=request.topic,
        history=request.history,
        user=current_user,
    )
    return TutorResponse(reply=response, mode=request.mode)


@router.post("/generate-roadmap", response_model=RoadmapResponse)
async def generate_roadmap(
    request: RoadmapRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a personalized learning roadmap for a topic."""
    roadmap = await curriculum_agent.generate_roadmap(
        topic=request.topic,
        level=request.level or current_user.learning_level.value,
        goal=request.goal,
    )
    return roadmap


@router.post("/quiz", response_model=QuizResponse)
async def generate_quiz(
    request: QuizRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate adaptive quiz questions for a topic."""
    quiz = await tutor_agent.generate_quiz(
        topic=request.topic,
        difficulty=request.difficulty or current_user.learning_level.value,
        count=request.count,
    )
    return quiz


@router.post("/explain", response_model=ExplainResponse)
async def explain_concept(
    request: ExplainRequest,
    current_user: User = Depends(get_current_user),
):
    """Explain a concept in multiple modes."""
    explanation = await tutor_agent.explain(
        concept=request.concept,
        mode=request.mode or "feynman",
        context=request.context,
    )
    return explanation


@router.post("/research")
async def research_topic(
    topic: str,
    current_user: User = Depends(get_current_user),
):
    """Phase 4: Research Copilot (Gemma 4)"""
    from agents.research_copilot import research_topic as do_research
    return await do_research(topic)


@router.post("/voice-tutor")
async def voice_tutor(
    prompt: str,
    current_user: User = Depends(get_current_user),
):
    """Phase 4: Voice Tutoring (Gemma 4 Orchestration)"""
    from agents.ai_client import ai_client
    if await ai_client.is_available():
        messages = [
            {"role": "system", "content": "You are a voice tutor. Generate a highly expressive, concise spoken script for the following prompt. Use SSML tags for pauses and emphasis."},
            {"role": "user", "content": prompt}
        ]
        script = await ai_client.chat(messages, temperature=0.7)
        return {"status": "ok", "message": "Voice processing orchestrated by Groq", "script": script}
    else:
        raise HTTPException(status_code=503, detail="Voice orchestrator (Gemma) offline.")


@router.post("/ar-visualize")
async def ar_visualize(
    concept: str,
    current_user: User = Depends(get_current_user),
):
    """Phase 4: AR/VR Spatial Concept Generation"""
    from agents.ai_client import ai_client
    import json
    
    if await ai_client.is_available():
        messages = [
            {"role": "system", "content": "You are a spatial visualization agent. Return ONLY a JSON object describing a basic 3D scene (geometries, positions, colors) for the given concept."},
            {"role": "user", "content": f"Visualize this concept in 3D: {concept}"}
        ]
        raw = await ai_client.chat(messages, temperature=0.5)
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        try:
            scene_data = json.loads(raw.strip())
        except:
            scene_data = {"error": "Failed to parse JSON scene"}
            
        return {"status": "ok", "concept": concept, "scene": scene_data, "orchestrator": "Groq"}
    else:
        raise HTTPException(status_code=503, detail="AR/VR orchestrator offline.")


# ─── Unified Chat Endpoint (uses Agent Router + Gemma 4 E2B) ─────

class UnifiedChatRequest(BaseModel):
    message: str
    mode: Optional[str] = "feynman"
    topic: Optional[str] = None
    history: List[ChatMessage] = []
    stream: bool = False


@router.post("/chat")
async def unified_chat(
    request: UnifiedChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Unified AI chat endpoint.
    Routes: User Query → Intent Detection (Gemma 4) → Agent → Response

    Supports streaming (set stream=true for token-by-token SSE).
    """
    from agents.ai_client import agent_router, ai_client

    if request.stream:
        async def event_stream():
            system_prompt = tutor_agent.MODE_PROMPTS.get(request.mode, tutor_agent.MODE_PROMPTS["feynman"])
            if request.topic:
                system_prompt += f"\n\nTopic: {request.topic}"
            messages = [{"role": "system", "content": system_prompt}]
            for h in request.history[-10:]:
                messages.append({"role": h.role, "content": h.content})
            messages.append({"role": "user", "content": request.message})

            try:
                async for chunk in ai_client.stream_chat(messages=messages, temperature=0.7):
                    yield f"data: {json.dumps({'delta': chunk})}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    # Non-streaming: route through agent router
    result = await agent_router.route(
        query=request.message,
        context={"mode": request.mode, "topic": request.topic, "user": current_user},
    )
    return result


@router.get("/status")
async def lm_studio_status():
    """
    Check LM Studio connection and list available models.
    Useful to verify Gemma 4 E2B is loaded and running.
    """
    from agents.ai_client import ai_client
    available = await ai_client.is_available()
    models = await ai_client.list_models() if available else []
    return {
        "ai_status": {
            "available": available,
            "current_model": ai_client.model,
            "loaded_models": [m.get("id") for m in models],
        },
        "message": (
            f"✅ Groq API running with {len(models)} model(s)" if available
            else "⚠️ Groq API not detected."
        ),
    }


@router.get("/memory/due")
async def get_due_memory_items(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Phase 2: Get spaced repetition items due for review"""
    from agents.memory_agent import get_due_items
    from datetime import datetime, timedelta
    
    # Mocking fetching user items from DB for now
    mock_user_items = [
        {"id": "topic-1", "concept": "Neural Networks", "next_review_date": datetime.utcnow() - timedelta(days=1)}
    ]
    due = get_due_items(mock_user_items)
    return {"status": "ok", "due_items": due}
