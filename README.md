# KnowledgeVerse (Local MVP)

Welcome to the KnowledgeVerse Local MVP! This repository has been streamlined to run entirely on your local machine with zero complex infrastructure setup. We rely on **SQLite** for the database and **LM Studio** for local AI inference, meaning you don't need Docker, cloud API keys, or heavy database installations (like PostgreSQL, Redis, or Neo4j) to get started.

## Prerequisites

- Node.js (for the frontend)
- Python 3.10+ (for the backend)
- [LM Studio](https://lmstudio.ai/) (for local AI inference)

## 1. Setup Local AI (LM Studio)

We use **LM Studio** as our primary AI engine for zero latency, maximum privacy, and zero API costs. The system relies on it for the Tutor Agent, Voice generation, AR object generation, and Research Copilot.

1. Download and install [LM Studio](https://lmstudio.ai/).
2. Search for and download the **Gemma 4 E2B** model (specifically `google/gemma-2-4b-it` or a similar quantization).
3. Go to the **Local Server** tab (the double arrow icon `<->` on the left).
4. Select the downloaded Gemma model from the top dropdown.
5. Click **Start Server** (it MUST run on port `1234` for the backend to connect).

## 2. Setup the Backend (FastAPI + Qdrant + SQLite)

The backend uses FastAPI. It uses **SQLite** (`knowledgeverse.db`) for relational data (users, progress, achievements) and a local **Qdrant** instance (running entirely in-memory/on-disk via `qdrant-client`) for vector embeddings.

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
4. **Seed the Database (CRITICAL FIRST STEP)**:
   This will create the SQLite tables, configure the Qdrant collections, and generate real semantic vector embeddings for all curriculum topics:
   ```bash
   python seed.py
   ```
5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will now be running at `http://127.0.0.1:8000`.

## 3. Verify the Algorithms (Optional)

We have an automated test suite to mathematically verify the core platform mechanics (Cognitive Index and Addiction Penalties).
While in the `backend` directory with the virtual environment activated, run:
```bash
python test_algorithms.py
```

## 4. Setup the Frontend (Next.js)

The frontend is a Next.js application using React Flow for the knowledge graph.

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will now be running at `http://localhost:3000`.

## 5. Testing the Un-Mocked Features
- **Deep Work Mode**: Click the floating "Focus Mode" button in the bottom right corner of the screen.
- **Knowledge Graph**: Go to the `/explore` page, search for a topic (e.g., "Machine Learning"), and watch React Flow dynamically render the NetworkX graph.
- **Gamification**: Go to your Profile to see real achievements and active guilds fetched dynamically from SQLite.
- **Addiction Penalty**: Watch a Feed topic for a long period, fail the quiz, and observe its Feed Score plummet.

## Features Available in MVP
- **Local AI Tutor:** Engage with the AI tutor routed seamlessly to your local LM Studio instance.
- **Concept Maps:** The UI provides a mock implementation of the knowledge graph (bypassing Neo4j) to visualize learning topics.
- **Data Persistence:** All learning progress is saved locally to your SQLite database.

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
