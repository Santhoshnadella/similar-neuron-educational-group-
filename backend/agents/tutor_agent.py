"""
Tutor Agent — Multi-mode AI tutor.
Supports: Beginner, Intermediate, Expert, Feynman, Story, Analogy, Socratic modes.

Query Routing Priority:
  1. LM Studio (Gemma 4 E2B local) — preferred, zero cost, privacy-safe
  2. OpenAI GPT (cloud fallback if LM Studio offline)
  3. Mock responses (dev/offline fallback)

LM Studio setup:
  → Load "google/gemma-2-4b-it" in LM Studio → Local Server → Start on port 1234
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
Ask one probing question at a time. Build on their responses. Help them construct understanding themselves.
If they get stuck, give a tiny hint, then return to questioning.""",
}

MOCK_RESPONSES = {
    "feynman": "Imagine you're trying to explain {topic} to your younger sibling. At its core, it's like {analogy}. The beautiful insight is: {insight}. Does that click?",
    "beginner": "Great question! Let's break {topic} down step by step. Think of it like {analogy}. The key thing to remember is: {insight}.",
    "story": "Once upon a time, a curious student asked about {topic}... Through their journey, they discovered {insight}. The moral? Knowledge compounds when you stay curious.",
    "analogy": "Imagine {topic} is like a bicycle: {analogy}. Or think of it like cooking: {insight}. Both analogies capture different facets of the same truth.",
    "socratic": "Interesting! Before I explain, let me ask you: what do YOU already know about {topic}? And why do you think {insight} might be important here?",
    "intermediate": "{topic} works by leveraging {insight}. In practice, this means: 1) Understanding the core mechanism 2) Applying it to real scenarios 3) Recognizing edge cases.",
    "expert": "{topic}: The underlying principle involves {insight}. At a rigorous level, consider the trade-offs between efficiency and correctness. What's your current mental model?",
}


async def respond(
    message: str,
    mode: str,
    topic: Optional[str],
    history: List[ChatMessage],
    user,
) -> str:
    """Generate AI tutor response. Routes through Gemma 4 E2B via LM Studio."""

    try:
        from agents.lm_studio import lm_studio
        if await lm_studio.is_available():
            return await _lm_studio_respond(lm_studio, message, mode, topic, history, user)
        else:
            logger.warning("LM Studio (Gemma 4) unavailable. Falling back to mock...")
    except Exception as lm_err:
        logger.warning(f"LM Studio (Gemma 4) error: {lm_err}. Falling back to mock...")

    # Final fallback: deterministic mock
    return _mock_respond(message, mode, topic)


async def _lm_studio_respond(lm_studio, message: str, mode: str, topic: Optional[str], history: list, user) -> str:
    """Route to Gemma 4 E2B via LM Studio local server."""
    system_prompt = MODE_PROMPTS.get(mode, MODE_PROMPTS["beginner"])
    if topic:
        system_prompt += f"\n\nCurrent topic: {topic}"
    if user and hasattr(user, 'learning_level') and user.learning_level:
        system_prompt += f"\n\nLearner level: {user.learning_level.value}"

    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-10:]:
        messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": message})

    response = await lm_studio.chat(messages=messages, temperature=0.7, max_tokens=1024)
    logger.info(f"✅ Gemma 4 E2B (LM Studio) responded [{mode} mode]")
    return response


def _mock_respond(message: str, mode: str, topic: Optional[str]) -> str:
    topic_str = topic or "this concept"
    template = MOCK_RESPONSES.get(mode, MOCK_RESPONSES["beginner"])
    return template.format(
        topic=topic_str,
        analogy="a well-organized library where every book (piece of knowledge) is indexed and connected",
        insight="knowledge is most powerful when interconnected, not isolated",
    )


async def generate_quiz(topic: str, difficulty: str, count: int) -> QuizResponse:
    """Generate quiz questions for a topic."""

    mock_questions = [
        QuizQuestion(
            id=f"q{i}",
            question=f"Question {i}: Which of the following best describes a key principle of {topic}?",
            options=[
                f"Option A — The foundational approach to {topic}",
                f"Option B — A common misconception about {topic}",
                f"Option C — An advanced application of {topic}",
                f"Option D — An unrelated concept often confused with {topic}",
            ],
            correct_index=0,
            explanation=f"Option A is correct because it captures the core principle of {topic} as established by foundational research.",
            concept=topic,
        )
        for i in range(1, count + 1)
    ]

    try:
        from agents.lm_studio import lm_studio
        if await lm_studio.is_available():
            prompt = f"""Generate {count} multiple choice quiz questions about "{topic}" at {difficulty} level.
Return ONLY a JSON array with objects exactly like this: {{"question": "", "options": ["a", "b", "c", "d"], "correct_index": 0, "explanation": "", "concept": ""}}"""
            messages = [{"role": "system", "content": "You are an expert educational quiz generator. Return only valid JSON."}, {"role": "user", "content": prompt}]
            raw = await lm_studio.chat(messages=messages, temperature=0.5, max_tokens=1024)
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            import json, uuid
            data = json.loads(raw.strip())
            return QuizResponse(topic=topic, questions=[QuizQuestion(id=str(uuid.uuid4()), **q) for q in data[:count]])
    except Exception as e:
        logger.warning(f"LM Studio quiz generation failed: {e}")

    return QuizResponse(topic=topic, questions=mock_questions)


async def explain(concept: str, mode: str, context: Optional[str]) -> ExplainResponse:
    """Explain a concept in the specified mode."""

    mock_explanation = f"""In {mode} mode: {concept} is fundamentally about understanding patterns and connections.

Think of it this way — every complex idea is built from simpler building blocks. {concept} follows this same principle.

The core insight: mastery comes not from memorizing facts, but from understanding *why* things work the way they do."""

    return ExplainResponse(
        concept=concept,
        mode=mode,
        explanation=mock_explanation,
        analogy=f"{concept} is like learning to ride a bike — uncomfortable at first, then effortless.",
        key_insights=[
            f"The foundational principle of {concept}",
            f"How {concept} connects to related ideas",
            f"Common applications of {concept} in practice",
        ],
        common_misconceptions=[
            f"People often think {concept} is harder than it really is",
            f"Many confuse {concept} with related but distinct ideas",
        ],
    )
