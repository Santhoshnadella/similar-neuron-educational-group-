"""
Tutor Agent — Multi-mode AI tutor.
Supports: Beginner, Intermediate, Expert, Feynman, Story, Analogy, Socratic modes.

Query Routing Priority:
  1. LM Studio (Gemma 4 E2B local) — preferred, zero cost, privacy-safe
  2. OpenAI GPT (cloud fallback if LM Studio offline)
  3. Mock responses (dev/offline fallback)

LM Studio setup:
  → This has been deprecated in favor of Groq Cloud AI API.
"""
from typing import List, Optional
from config import settings
from agents.schemas import ChatMessage, QuizQuestion, QuizResponse, ExplainResponse
import logging

logger = logging.getLogger(__name__)

# Mode system prompts
MODE_PROMPTS = {
    "beginner": """You are KnowledgeVerse's AI Tutor in BEGINNER mode.
Explain concepts using simple language (grade 8 level), short sentences, relatable everyday examples.
Avoid jargon. Use analogies to familiar things. Always check understanding with a simple question at the end.
Keep responses concise and encouraging.""",

    "intermediate": """You are KnowledgeVerse's AI Tutor in INTERMEDIATE mode.
Explain concepts with moderate technical depth. Use proper terminology but define it clearly.
Connect ideas to real-world applications. Include brief examples and clarify common misconceptions.""",

    "expert": """You are KnowledgeVerse's AI Tutor in EXPERT mode.
Engage at a high technical level. Use precise terminology. Discuss edge cases, nuances, and deep principles.
Challenge assumptions and explore advanced implications. Be succinct and rigorous.""",

    "feynman": """You are KnowledgeVerse's AI Tutor using the FEYNMAN TECHNIQUE.
Explain as if teaching to a 12-year-old who has never heard of this topic.
Use only the simplest possible words. Find the core insight. If you cannot explain it simply, acknowledge the gap.
Structure: (1) Core idea in one sentence. (2) Simple analogy. (3) Why it matters.""",

    "story": """You are KnowledgeVerse's AI Tutor in STORY mode.
Turn the concept into a compelling narrative. Use characters, conflict, and resolution.
Make the idea memorable through vivid storytelling. The lesson should emerge naturally from the story.""",

    "analogy": """You are KnowledgeVerse's AI Tutor in ANALOGY mode.
Explain the concept ONLY through powerful analogies and metaphors.
Give 2-3 different analogies from different domains (nature, sports, cooking, technology, etc.).
Then explain why each analogy works and where it breaks down.""",

    "socratic": """You are KnowledgeVerse's AI Tutor in SOCRATIC mode.
Do NOT explain directly. Instead, guide the learner to discover the answer through questions.
1. First, strictly evaluate the learner's previous answer for accuracy and reasoning.
2. If they are wrong, gently point out the gap, and ask a clarifying question.
3. Ask EXACTLY ONE probing question at a time. Build on their responses.
If they get stuck, give a tiny hint, then return to questioning.""",
}



async def respond(
    message: str,
    mode: str,
    topic: Optional[str],
    history: List[ChatMessage],
    user,
) -> str:
    """Generate AI tutor response. Routes through Groq API."""

    try:
        from agents.ai_client import ai_client
        if await ai_client.is_available():
            return await _ai_client_respond(ai_client, message, mode, topic, history, user)
        else:
            raise Exception("Groq API unavailable.")
    except Exception as e:
        logger.error(f"Groq API error: {e}.")
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="AI Tutor is currently offline. Please ensure API keys are set.")


async def _ai_client_respond(ai_client, message: str, mode: str, topic: Optional[str], history: list, user) -> str:
    """Route to Groq API."""
    system_prompt = MODE_PROMPTS.get(mode, MODE_PROMPTS["beginner"])
    if topic:
        system_prompt += f"\n\nCurrent topic: {topic}"
    if user and hasattr(user, 'learning_level') and user.learning_level:
        system_prompt += f"\n\nLearner level: {user.learning_level.value}"

    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-10:]:
        messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": message})

    response = await ai_client.chat(messages=messages, temperature=0.7, max_tokens=1024)
    logger.info(f"✅ Groq responded [{mode} mode]")
    return response





async def generate_quiz(topic: str, difficulty: str, count: int) -> QuizResponse:
    """Generate quiz questions for a topic."""

    try:
        from agents.ai_client import ai_client
        if await ai_client.is_available():
            prompt = f"""Generate {count} multiple choice quiz questions about "{topic}" at {difficulty} level.
Return ONLY a JSON array with objects exactly like this: {{"question": "", "options": ["a", "b", "c", "d"], "correct_index": 0, "explanation": "", "concept": ""}}"""
            messages = [{"role": "system", "content": "You are an expert educational quiz generator. Return only valid JSON."}, {"role": "user", "content": prompt}]
            raw = await ai_client.chat(messages=messages, temperature=0.5, max_tokens=1024)
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            import json, uuid
            data = json.loads(raw.strip())
            return QuizResponse(topic=topic, questions=[QuizQuestion(id=str(uuid.uuid4()), **q) for q in data[:count]])
        else:
            raise Exception("Groq API unavailable.")
    except Exception as e:
        logger.error(f"Groq quiz generation failed: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Quiz generation is currently offline. Please ensure Groq API keys are set.")


async def explain(concept: str, mode: str, context: Optional[str]) -> ExplainResponse:
    """Explain a concept in the specified mode."""

    try:
        from agents.ai_client import ai_client
        if await ai_client.is_available():
            prompt = f"""Explain the concept of "{concept}" in {mode} mode.
Return ONLY a JSON object with this exact structure:
{{
    "explanation": "Detailed explanation here...",
    "analogy": "A clear analogy here...",
    "key_insights": ["Insight 1", "Insight 2"],
    "common_misconceptions": ["Misconception 1", "Misconception 2"]
}}"""
            messages = [{"role": "system", "content": "You are an expert tutor. Return only valid JSON."}, {"role": "user", "content": prompt}]
            raw = await ai_client.chat(messages=messages, temperature=0.5, max_tokens=1024)
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            import json
            data = json.loads(raw.strip())
            return ExplainResponse(
                concept=concept,
                mode=mode,
                explanation=data.get("explanation", ""),
                analogy=data.get("analogy", ""),
                key_insights=data.get("key_insights", []),
                common_misconceptions=data.get("common_misconceptions", [])
            )
        else:
            raise Exception("Groq API unavailable.")
    except Exception as e:
        logger.error(f"Groq explain generation failed: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Explanation generation is currently offline. Please ensure Groq API keys are set.")
