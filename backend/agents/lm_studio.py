"""
LM Studio Local LLM Client
===========================
LM Studio runs a local OpenAI-compatible server.
Load Gemma 4 E2B (or any model) in LM Studio, then point this config to it.

Flow:
  User Query
    ↓
  Intent Detection (local)
    ↓
  Agent Router
    ↓
  LM Studio → Gemma 4 E2B (via OpenAI-compat API at localhost:1234)
    ↓
  Tutor / Curriculum / Memory / Socratic Agent
    ↓
  Personalized Response → App

LM Studio Setup:
  1. Open LM Studio → Local Server tab
  2. Load model: "google/gemma-2-4b-it" (or Gemma 4 E2B variant)
  3. Start server on port 1234
  4. Set LM_STUDIO_URL in .env (default: http://localhost:1234)
"""
import httpx
import json
from typing import AsyncIterator, Optional, List, Dict, Any
from config import settings
import logging

logger = logging.getLogger(__name__)

# LM Studio runs OpenAI-compatible API at this base URL
LM_STUDIO_BASE_URL = getattr(settings, "LM_STUDIO_URL", "http://localhost:1234")
LM_STUDIO_MODEL = getattr(settings, "LM_STUDIO_MODEL", "gemma-2-4b-it")  # as shown in LM Studio


class LMStudioClient:
    """
    Async client for LM Studio's OpenAI-compatible API.
    Routes all AI queries through the locally running Gemma 4 E2B model.
    """

    def __init__(self):
        self.base_url = LM_STUDIO_BASE_URL
        self.model = LM_STUDIO_MODEL
        self.headers = {
            "Content-Type": "application/json",
            # LM Studio accepts any API key value
            "Authorization": "Bearer lm-studio",
        }

    async def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
        stream: bool = False,
    ) -> str:
        """
        Send a chat completion request to LM Studio (Gemma 4 E2B).
        Returns the assistant's text response.
        """
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream,
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/v1/chat/completions",
                    headers=self.headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]

        except httpx.ConnectError:
            logger.warning(
                f"⚠️  LM Studio not running at {self.base_url}. "
                "Please open LM Studio → Local Server → Start Server. "
                "Falling back to mock response."
            )
            raise LMStudioNotAvailableError("LM Studio server not reachable")

        except httpx.HTTPStatusError as e:
            logger.error(f"LM Studio HTTP error: {e.response.status_code} — {e.response.text}")
            raise

        except Exception as e:
            logger.error(f"LM Studio error: {e}")
            raise

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> AsyncIterator[str]:
        """
        Stream tokens from LM Studio (Gemma 4 E2B) for real-time chat.
        Yields text chunks as they arrive.
        """
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/v1/chat/completions",
                headers=self.headers,
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            delta = data["choices"][0].get("delta", {})
                            if "content" in delta and delta["content"]:
                                yield delta["content"]
                        except json.JSONDecodeError:
                            continue

    async def is_available(self) -> bool:
        """Check if LM Studio server is running."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/v1/models")
                return resp.status_code == 200
        except Exception:
            return False

    async def list_models(self) -> List[Dict]:
        """List all models loaded in LM Studio."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{self.base_url}/v1/models",
                    headers=self.headers,
                )
                data = resp.json()
                return data.get("data", [])
        except Exception:
            return []


class LMStudioNotAvailableError(Exception):
    pass


# ─── Singleton ──────────────────────────────────────────────────
lm_studio = LMStudioClient()


# ─── Agent Router ───────────────────────────────────────────────
class AgentRouter:
    """
    Routes user queries to the appropriate agent based on intent.

    Intent Detection → Gemma 4 E2B (via LM Studio)
      → "tutor"      → Tutor Agent
      → "roadmap"    → Curriculum Agent
      → "quiz"       → Quiz Agent
      → "explain"    → Explain Agent
      → "research"   → Research Agent
      → "recall"     → Memory Agent
    """

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
        """Use Gemma 4 to detect user intent."""
        try:
            intent = await lm_studio.chat(
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
        except LMStudioNotAvailableError:
            return "tutor"  # Default fallback

    async def route(self, query: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Full pipeline:
        Query → Intent → Agent → Gemma 4 E2B → Response
        """
        intent = await self.detect_intent(query)
        logger.info(f"🧭 Agent Router: '{query[:50]}...' → intent='{intent}'")

        result = {
            "intent": intent,
            "query": query,
            "response": None,
            "model": lm_studio.model,
            "source": "lm_studio",
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


# ─── Singleton router ────────────────────────────────────────────
agent_router = AgentRouter()
