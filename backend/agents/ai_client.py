"""
Cloud AI Client (Groq)
===========================
Routes all AI queries through Groq API.
"""
from groq import AsyncGroq
import json
from typing import AsyncIterator, List, Dict, Any
from config import settings
import logging

logger = logging.getLogger(__name__)

GROQ_API_KEY = getattr(settings, "GROQ_API_KEY", "")
AI_MODEL = getattr(settings, "AI_MODEL", "llama-3.1-8b-instant")

class AIClient:
    def __init__(self):
        self.model = AI_MODEL
        self.client = AsyncGroq(api_key=GROQ_API_KEY)

    async def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        stream: bool = False,
    ) -> str:
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=False
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> AsyncIterator[str]:
        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"Groq Stream Error: {e}")
            raise

    async def is_available(self) -> bool:
        return bool(GROQ_API_KEY)

    async def list_models(self) -> List[Dict]:
        return [{"id": self.model}]

ai_client = AIClient()

class AgentRouter:
    INTENT_SYSTEM_PROMPT = """You are an intent classifier for KnowledgeVerse, an educational AI platform.
Classify the user's query into ONE of these intents:
- tutor: user wants to learn or understand something
- roadmap: user wants a learning path or curriculum
- quiz: user wants to be tested or practice
- explain: user wants a concept explained in a specific way
- research: user wants resources or information found
- recall: user wants to review or practice spaced repetition

Respond with ONLY the intent word, nothing else."""

    async def detect_intent(self, query: str) -> str:
        try:
            intent = await ai_client.chat(
                messages=[
                    {"role": "system", "content": self.INTENT_SYSTEM_PROMPT},
                    {"role": "user", "content": query},
                ],
                temperature=0.1,
                max_tokens=10,
            )
            intent = intent.strip().lower()
            valid = {"tutor", "roadmap", "quiz", "explain", "research", "recall"}
            return intent if intent in valid else "tutor"
        except Exception:
            return "tutor"

    async def route(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        intent = await self.detect_intent(query)
        result = {
            "intent": intent,
            "query": query,
            "response": None,
            "model": ai_client.model,
            "source": "groq",
        }
        try:
            if intent == "tutor":
                from agents.tutor_agent import respond
                mode = (context or {}).get("mode", "feynman")
                result["response"] = await respond(
                    message=query, mode=mode, topic=None,
                    history=[], user=context.get("user") if context else None
                )
            elif intent == "roadmap":
                from agents.curriculum_agent import generate_roadmap
                roadmap = await generate_roadmap(topic=query, level="intermediate", goal=None)
                result["response"] = roadmap.model_dump()
            elif intent == "quiz":
                from agents.tutor_agent import generate_quiz
                quiz = await generate_quiz(topic=query, difficulty="intermediate", count=5)
                result["response"] = quiz.model_dump()
            elif intent == "explain":
                from agents.tutor_agent import explain
                explanation = await explain(concept=query, mode="feynman", context=None)
                result["response"] = explanation.model_dump()
            else:
                result["response"] = f"Processing your {intent} request about: {query}"
        except Exception as e:
            logger.error(f"Agent routing error: {e}")
            result["response"] = "I'm processing your request. Please try again in a moment."
            result["source"] = "fallback"
        return result

agent_router = AgentRouter()
