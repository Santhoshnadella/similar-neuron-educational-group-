# KnowledgeVerse

Welcome to **KnowledgeVerse**! An AI-native educational social network + adaptive LMS + cognitive operating system.

We have officially transitioned from a local MVP to a full-stack, cloud-native architecture. The platform now utilizes **Neon Serverless PostgreSQL** for dynamic data persistence, **Vercel** for frontend delivery, **Render** for the Python backend, and **Groq** for ultra-fast cloud AI inference. 

## Tech Stack Overview
- **Frontend:** Next.js (React), Clerk (Authentication), Framer Motion, React Flow
- **Backend:** FastAPI (Python), SQLAlchemy (Async), Pydantic
- **Database:** Neon Serverless PostgreSQL
- **Vector Search (In-Progress):** Qdrant
- **AI Inference:** Groq API (Llama 3) / Local LLM Fallback (LM Studio)

## 1. Setup the Backend (FastAPI)

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` file in the root of the project with your cloud API keys:
   ```env
   DATABASE_URL="postgresql+asyncpg://<user>:<password>@<host>/neondb?ssl=require"
   GROQ_API_KEY="your-groq-api-key"
   APP_SECRET_KEY="your-random-secure-string"
   JWT_SECRET="your-random-jwt-string"
   ```
5. **Seed the Database**:
   This will create the PostgreSQL tables and generate initial curriculum data:
   ```bash
   python seed_production.py
   ```
6. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will now be running at `http://127.0.0.1:8000`.

## 2. Setup the Frontend (Next.js)

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Set up the frontend environment variables in `.env`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-pub-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
   ```
3. Install the Node dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will now be running at `http://localhost:3000`.

---


## Our Moat: The KnowledgeVerse Vision

An AI-native educational social network + adaptive LMS + cognitive operating system.

### CORE VISION
Build a platform that combines:
* Instagram/TikTok engagement
* YouTube depth
* Duolingo gamification
* Notion knowledge systems
* Khan Academy mastery learning
* OpenAI-style AI tutoring
* Cognitive science
* Adaptive learning
* Knowledge graphs
* Human performance optimization

The platform should transform:
* scrolling → learning
* entertainment → cognitive growth
* passive consumption → mastery
* fragmented knowledge → connected intelligence

### PRIMARY PRODUCT MODULES
1. **Educational Social Feed:** Short-form educational content.
2. **AI Adaptive LMS:** Personalized learning pathways.
3. **Knowledge Graph Engine:** Concept dependency mapping.
4. **AI Agent Ecosystem:** Specialized educational agents.
5. **Cognitive Assessment Engine:** Learner profiling.
6. **Creator Studio:** AI-assisted educational content creation.
7. **Deep Learning Mode:** Focus-first long-form mastery.
8. **Gamified Skill Trees:** Progression systems.
9. **Community Layer:** Debates, guilds, projects.
10. **Human Optimization Dashboard:** Memory, focus, cognition analytics.

### HOW WE ROUTE LOGIC TO LM STUDIO (ORCHESTRATION FLOW)
To power this vision without incurring massive API costs or compromising user privacy, we've routed our core AI orchestration directly into **LM Studio**. 
- **The Tutor Agent (`agents/tutor_agent.py`)** acts as the engine for personalized learning. Instead of sending requests to OpenAI or Anthropic, our backend dynamically constructs system prompts based on the learner's desired mode (e.g., Feynman, Socratic, Story, Expert) and sends them to the local `gemma-2-4b-it` model hosted on LM Studio via its OpenAI-compatible local server API (port 1234). 
- **Zero-Latency Orchestration:** By running everything on the same machine, the local model acts as an embedded intelligence layer, handling quiz generation, concept explanations, and dialogue instantaneously.
- **Fallback Resilience:** If LM Studio isn't running, the system gracefully degrades to high-quality deterministic mock responses, ensuring the MVP never breaks during offline presentations.

**Agent Routing Pipeline:**
```text
User Query → Intent Detection → Agent Router → Research Agent → Curriculum Agent → Tutor Agent → Memory Agent → Personalized Output
```

### AI AGENT ECOSYSTEM
- **Tutor Agent:** Teaches concepts, adapts explanations, detects confusion across multiple modes (Beginner, Intermediate, Expert, Feynman, Story, Analogy).
- **Memory Agent:** Handles spaced repetition, recall scheduling, and forgetting curve optimization (FSRS, SM2).
- **Socratic Agent:** Asks reasoning questions and develops critical thinking.
- **Focus Coach Agent:** Detects distraction, optimizes session timing, and recommends breaks.
- **Creativity Agent:** Drives cross-domain idea synthesis and innovation exercises.

### FEED RANKING LOGIC & RECOMMENDATION ENGINE
**Inputs:** Watch time, replays, recall/quiz performance, curiosity patterns, session duration, focus quality, knowledge gaps, and goals.
**Outputs:** Personalized feed, learning roadmap, revision recommendations, and deep-learning suggestions.

**Algorithm:**
```python
FeedScore = (
  EngagementWeight * EngagementScore +
  LearningValueWeight * EducationalQuality +
  RetentionWeight * RecallImprovement +
  CuriosityWeight * TopicNovelty +
  MasteryWeight * SkillProgression
) - AddictionPenalty
```

### COGNITIVE ASSESSMENT ENGINE
Evaluates Working Memory (n-back tests), Attention (continuous performance tasks), Spatial Reasoning (mental rotation), Processing Speed (timed pattern recognition), and Verbal Intelligence (semantic reasoning).

**Scoring:**
```python
CognitiveIndex = (
  0.2 * WorkingMemory +
  0.15 * Attention +
  0.2 * ProcessingSpeed +
  0.2 * LogicalReasoning +
  0.15 * Creativity +
  0.1 * EmotionalRegulation
)
```

### CONTENT TEMPLATE & UPLOAD SCHEMA
**Knowledge Reel Template:**
1. Hook (Pattern interrupt)
2. Curiosity Gap (“What if…”)
3. Core Insight (Pareto concept)
4. Visualization (Diagram/animation)
5. Retrieval Prompt (Quick quiz)
6. CTA (Continue learning path)

**Creator Upload Schema:**
```json
{
  "title": "",
  "domain": "",
  "difficulty": 1,
  "concepts": [],
  "prerequisites": [],
  "learning_objective": "",
  "feynman_explanation": "",
  "quiz_questions": [],
  "references": []
}
```

### FINAL OBJECTIVE
Build a learning operating system, an educational social network, a cognitive augmentation platform, a human potential ecosystem, and a knowledge civilization infrastructure that combines neuroscience, AI, systems thinking, classical education, cognitive science, social learning, creativity, and deep understanding into one unified platform.

---

## Contributing & Coding Standards

We welcome contributions to the KnowledgeVerse ecosystem! If you are interested in submitting code, please review our standards to ensure a clean, maintainable, and high-quality codebase.

### 1. Code Architecture & Style
- **Frontend (Next.js/React):**
  - Use **functional components** and React Hooks.
  - Strict **TypeScript** typing is required for all new components, state, and API responses.
  - Follow the established **KnowledgeVerse Design System** (use `var(--kv-...)` CSS variables for colors, spacing, and borders). Avoid hardcoded hex colors.
- **Backend (FastAPI/Python):**
  - Use **Pydantic models** (`schemas.py`) for all request/response validation.
  - All database interactions must use **SQLAlchemy AsyncSessions**. Do not use raw SQL.
  - Keep route handlers thin. All core business and AI logic should live in the respective `service.py` files.

### 2. Commit Message Template
Please format your commit messages using the following standard to keep the Git history readable:
```text
[Type]: [Short summary of changes]

[Detailed description of why this change was made, what it fixes, or the logic behind it]

Related Issues: #[Issue Number]
```
**Types:** 
- `feat` (new feature)
- `fix` (bug fix)
- `docs` (documentation)
- `style` (UI formatting/CSS)
- `refactor` (code restructuring without changing behavior)
- `chore` (maintenance, dependencies)

### 3. Pull Request (PR) Checklist
Before submitting a Pull Request, please ensure you have verified the following:
- [ ] **Tests Passed:** I have tested my changes locally and verified they do not break existing features.
- [ ] **No Secrets Exposed:** I have verified that no API keys, tokens, or passwords are hardcoded.
- [ ] **Type Safety:** All new TypeScript and Python code has strict type annotations.
- [ ] **Documentation:** I have updated the README or inline docstrings if my changes affect the system's architecture.

### 4. Setting up for Development
To get started with development, follow the Local Setup Guide at the top of this README. Ensure you test your changes with LM Studio running locally to verify the AI integration pipeline.
