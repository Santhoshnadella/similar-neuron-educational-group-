"""
Content Service — Educational content creation, management, and AI enrichment.
Includes auto-embedding generation and cognitive profile updates.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import Content, User, LearningSession
from content.schemas import ContentCreate
from datetime import datetime, timezone
import logging
import json

logger = logging.getLogger(__name__)


async def create_content(
    db: AsyncSession,
    data: ContentCreate,
    creator_id: str,
) -> Content:
    """
    Create new educational content with AI enrichment.
    
    Steps:
    1. Create content record
    2. Generate embeddings (vector DB)
    3. Extract concepts and prerequisites (AI)
    4. Generate quiz questions (AI)
    5. Calculate learning value estimate (ML scoring)
    """
    from config import settings
    
    content = Content(
        creator_id=creator_id,
        title=data.title,
        type=data.type or "reel",
        domain=data.domain,
        body=data.body,
        media_url=data.media_url if hasattr(data, "media_url") else None,
        thumbnail_url=data.thumbnail_url if hasattr(data, "thumbnail_url") else None,
        difficulty_level=data.difficulty_level or 5,
        learning_objective=data.learning_objective,
        concepts=data.concepts if hasattr(data, "concepts") else [],
        prerequisites=data.prerequisites if hasattr(data, "prerequisites") else [],
        quiz_questions=data.quiz_questions if hasattr(data, "quiz_questions") else [],
        feynman_explanation=data.feynman_explanation if hasattr(data, "feynman_explanation") else "",
        references=data.references if hasattr(data, "references") else [],
        is_published=data.is_published or False,
    )
    
    # Calculate initial learning value
    content.estimated_learning_value = 0.5 + (content.difficulty_level / 20)
    
    db.add(content)
    await db.flush()  # Get content.id
    
    # AI Enrichment (async in background ideally)
    try:
        await _enrich_content_with_ai(db, content, data)
    except Exception as e:
        logger.warning(f"AI enrichment failed for content {content.id}: {e}")
    
    # Generate embeddings for vector search
    try:
        await _generate_embedding(content)
    except Exception as e:
        logger.warning(f"Embedding generation failed: {e}")
    
    await db.commit()
    await db.refresh(content)
    return content


async def _enrich_content_with_ai(
    db: AsyncSession,
    content: Content,
    data: ContentCreate,
) -> None:
    """AI-assisted content enrichment using Gemma 4 via LM Studio."""
    
    from agents.lm_studio import lm_studio
    
    if not await lm_studio.is_available():
        logger.info("LM Studio (Gemma 4) not available; skipping AI enrichment")
        return
    
    try:
        prompt = f"""
Analyze this educational content and extract:
1. Key concepts (list of 3-5 concepts taught)
2. Prerequisites (what knowledge is required before this)
3. Feynman-style simple explanation (150 words max)
4. 2 quiz questions (multiple choice with 4 options, specify correct index 0-3)

Content:
Title: {content.title}
Domain: {content.domain}
Body: {content.body[:500] if content.body else ""}

Return ONLY valid JSON (no markdown):
{{
  "concepts": ["concept1", "concept2"],
  "prerequisites": ["prereq1"],
  "feynman_explanation": "simple explanation...",
  "quiz_questions": [
    {{"question": "What is X?", "options": ["a", "b", "c", "d"], "correct_index": 0}}
  ]
}}
"""
        messages = [{"role": "system", "content": "You are a precise JSON generator. Return only valid JSON."}, {"role": "user", "content": prompt}]
        response_text = await lm_studio.chat(messages=messages, temperature=0.3, max_tokens=1024)
        
        # Clean response
        response_text = response_text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()
        
        enriched = json.loads(response_text)
        
        content.concepts = enriched.get("concepts", content.concepts or [])
        content.prerequisites = enriched.get("prerequisites", content.prerequisites or [])
        content.feynman_explanation = enriched.get("feynman_explanation", "")
        content.quiz_questions = enriched.get("quiz_questions", content.quiz_questions or [])
        content.estimated_learning_value = min(1.0, 0.75 + (len(content.concepts) * 0.05))
        
        logger.info(f"Gemma 4 enrichment successful for content {content.id}")
        
    except Exception as e:
        logger.error(f"Gemma 4 enrichment error: {e}")


async def _generate_embedding(content: Content) -> None:
    """Generate vector embedding for semantic search (Qdrant integration stub)."""
    
    try:
        from sentence_transformers import SentenceTransformer
        
        # Load embedding model
        model = SentenceTransformer("all-MiniLM-L6-v2")
        
        # Create embedding text
        text = f"{content.title} {(content.body or '')[:500]} {' '.join(content.concepts or [])}"
        
        # Generate embedding
        embedding = model.encode(text, convert_to_tensor=False)
        
        # TODO: Store in Qdrant
        # from qdrant_client import QdrantClient
        # client = QdrantClient(":memory:")
        # client.upsert(collection_name="content", points=[...])
        
        logger.info(f"Embedding generated for content {content.id} ({len(embedding)} dims)")
        content.embedding_id = f"emb_{content.id}"  # Placeholder
        
    except Exception as e:
        logger.warning(f"Embedding generation failed: {e}")


async def update_cognitive_profile_from_session(
    db: AsyncSession,
    user: User,
    session: LearningSession,
) -> None:
    """
    Update user's cognitive profile based on learning session performance.
    
    Metrics updated:
    - comprehension_score → working_memory
    - recall_score → processing_speed
    - focus_score → attention_control
    - watch_time → sustained attention
    """
    
    if not user.cognitive_profile:
        return
    
    profile = user.cognitive_profile
    
    # Comprehension improves working memory
    if session.comprehension_score is not None:
        profile.working_memory = (
            profile.working_memory * 0.9 + 
            (session.comprehension_score * 100) * 0.1
        )
    
    # Recall improves processing speed (retention/memory)
    if session.recall_score is not None:
        profile.processing_speed = (
            profile.processing_speed * 0.9 +
            (session.recall_score * 100) * 0.1
        )
    
    # Focus score directly updates attention control
    if session.focus_score is not None:
        profile.attention_control = (
            profile.attention_control * 0.9 +
            session.focus_score * 0.1
        )
    
    # Watch time indicates sustained attention (normalize to 1 hour = max)
    time_score = min(1.0, session.watch_time / 3600.0)
    profile.attention_control = (
        profile.attention_control * 0.95 +
        time_score * 100 * 0.05
    )
    
    # Update composite cognitive index
    profile.cognitive_index = (
        profile.working_memory * 0.25 +
        profile.processing_speed * 0.25 +
        profile.attention_control * 0.20 +
        profile.spatial_reasoning * 0.10 +
        profile.creativity * 0.10 +
        profile.emotional_regulation * 0.10
    )
    
    profile.last_assessed = datetime.now(timezone.utc)
    
    await db.commit()


async def seed_db(db: AsyncSession) -> int:
    """
    Seed the database with test users (learner and creator)
    and 11 high-quality educational content items across various domains.
    """
    from db.models import User, Content, CognitiveProfile, LearningLevel, ContentType
    from auth.service import hash_password
    
    # 1. Check if content already exists
    content_count_result = await db.execute(select(Content))
    content_count = len(content_count_result.scalars().all())
    if content_count > 0:
        logger.info(f"Database already seeded with {content_count} content items.")
        return content_count

    logger.info("🌱 Seeding database with KnowledgeVerse MVP demo data...")

    # 2. Create Creator
    creator_profile = CognitiveProfile(
        working_memory=85.0, processing_speed=80.0, attention_control=90.0,
        spatial_reasoning=75.0, creativity=95.0, emotional_regulation=85.0,
        cognitive_index=85.0
    )
    db.add(creator_profile)
    await db.flush()

    creator = User(
        username="expert_curator",
        email="creator@knowledgeverse.ai",
        hashed_password=hash_password("password123"),
        cognitive_profile_id=creator_profile.id,
        learning_level=LearningLevel.EXPERT,
        is_creator=True,
        xp=5000,
        level=5
    )
    db.add(creator)
    await db.flush()

    # 3. Create Learner (Student)
    student_profile = CognitiveProfile(
        working_memory=45.0, processing_speed=40.0, attention_control=50.0,
        spatial_reasoning=40.0, creativity=60.0, emotional_regulation=55.0,
        cognitive_index=48.5
    )
    db.add(student_profile)
    await db.flush()

    student = User(
        username="student",
        email="student@knowledgeverse.ai",
        hashed_password=hash_password("password123"),
        cognitive_profile_id=student_profile.id,
        learning_level=LearningLevel.BEGINNER,
        is_creator=False,
        xp=0,
        level=1,
        streak=3
    )
    db.add(student)
    await db.flush()

    # 4. Seed Content Items
    items_to_seed = [
        {
            "title": "The Feynman Technique: Learn Anything 10x Faster",
            "domain": "Learning Science",
            "difficulty_level": 2,
            "body": "Richard Feynman, Nobel Prize-winning physicist, developed a learning method that forces true understanding. The secret: if you can't explain it simply, you don't understand it yet.\n\nStep 1: Choose a concept. Step 2: Teach it to a child. Step 3: Identify gaps. Step 4: Simplify and use analogies. By translating jargon into plain English, you expose structural gaps in your reasoning.",
            "concepts": ["Meta-learning", "Cognition", "Memory"],
            "learning_objective": "Master the Feynman learning technique",
            "feynman_explanation": "Choose what you want to learn, then try to explain it in simple words, like you are talking to a kid. If you get stuck, look it up again until you can explain it easily without using big words.",
            "quiz_questions": [
                {
                    "question": "What is the core principle of the Feynman Technique?",
                    "options": ["Memorize everything", "Explain simply to find gaps", "Read textbooks repeatedly", "Take detailed notes"],
                    "correct_index": 1,
                    "explanation": "Feynman believed true understanding requires being able to explain a concept in the simplest terms."
                }
            ]
        },
        {
            "title": "Neural Networks: The Brain-Inspired Revolution",
            "domain": "AI & ML",
            "difficulty_level": 6,
            "body": "Deep learning mimics the brain's neural architecture. A single neuron receives inputs, applies weights, adds a bias, and passes the sum through an activation function. When we stack millions of these in layers, we get machine intelligence.\n\nThe real magic is Backpropagation: credit assignment across layers via gradient descent. Every mistake teaches the network something by adjusting weights in reverse.",
            "concepts": ["Deep Learning", "Backpropagation", "Gradient Descent"],
            "learning_objective": "Understand how neural networks learn",
            "feynman_explanation": "Neural networks are like groups of digital workers passing signals. When they make a mistake, we tell them how wrong they were, and they adjust their rules backward so they do better next time.",
            "quiz_questions": [
                {
                    "question": "What does backpropagation do in a neural network?",
                    "options": ["Initializes weights randomly", "Propagates gradients backward to update weights", "Normalizes input data", "Selects the architecture"],
                    "correct_index": 1,
                    "explanation": "Backpropagation computes gradients of the loss with respect to weights, enabling learning."
                }
            ]
        },
        {
            "title": "Spaced Repetition: The Science of Never Forgetting",
            "domain": "Neuroscience",
            "difficulty_level": 3,
            "body": "Hermann Ebbinghaus discovered the forgetting curve in 1885. Without review, you forget 70% within 24 hours. Spaced repetition defeats this by reviewing information at precise, expanding intervals.\n\nThe FSRS algorithm (used in Anki) predicts exactly when you'll forget something and schedules review at the optimal moment — just before forgetting, which strengthens the neural pathway.",
            "concepts": ["Spaced Repetition", "Forgetting Curve", "FSRS"],
            "learning_objective": "Apply spaced repetition for long-term memory",
            "feynman_explanation": "If you don't review, you forget things quickly. Spaced repetition means reviewing just before you forget. It makes your brain think the info is important, so it keeps it forever.",
            "quiz_questions": [
                {
                    "question": "What percentage of information is forgotten within 24 hours without review?",
                    "options": ["30%", "50%", "70%", "90%"],
                    "correct_index": 2,
                    "explanation": "Ebbinghaus's experiments showed ~70% forgetting rate within 24 hours without active review."
                }
            ]
        },
        {
            "title": "Systems Thinking: Finding Leverage Points",
            "domain": "Programming",
            "difficulty_level": 5,
            "body": "Most problems aren't isolated issues — they are symptoms of underlying systems. Systems thinking teaches you to find the causal loops, feedback mechanisms, and leverage points that drive complex behavior.\n\nKey insight: the solution to a problem is often counterintuitive. Pushing harder in the wrong place makes systems worse.",
            "concepts": ["Systems Thinking", "Feedback Loops", "Mental Models"],
            "learning_objective": "Apply systems thinking to complex problems",
            "feynman_explanation": "Instead of just fixing a broken part, systems thinking is looking at how all parts affect each other. It helps find the one key spot where a small change makes a huge difference.",
            "quiz_questions": [
                {
                    "question": "What is a feedback loop in systems thinking?",
                    "options": ["A loop of wire", "A cycle where outputs feed back as inputs", "A way to code functions", "A method for checking bugs"],
                    "correct_index": 1,
                    "explanation": "A feedback loop is a mechanism where the output of a system circles back to influence the input."
                }
            ]
        },
        {
            "title": "Quantum Computing: Superposition & Entanglement",
            "domain": "Physics",
            "difficulty_level": 8,
            "body": "Classical computers use bits (0 or 1). Quantum computers use qubits which can exist in a superposition of both 0 and 1 simultaneously. This allows them to process massive computations in parallel.\n\nEntanglement binds qubits together; changing one instantly affects the other, regardless of distance. This unlocks exponential processing scaling.",
            "concepts": ["Quantum Mechanics", "Superposition", "Entanglement"],
            "learning_objective": "Explain qubits, superposition, and entanglement",
            "feynman_explanation": "A regular coin on a table is either heads or tails (0 or 1). A spinning coin is in superposition — both heads and tails at once. Quantum computers compute using these spinning coins.",
            "quiz_questions": [
                {
                    "question": "What is superposition in quantum computing?",
                    "options": ["A state of being 0 and 1 at the same time", "A very fast processor", "A new computer programming language", "A method of cooling components"],
                    "correct_index": 0,
                    "explanation": "Superposition allows a quantum system to exist in multiple states simultaneously."
                }
            ]
        },
        {
            "title": "Neuroplasticity: How Your Brain Rewires Itself",
            "domain": "Neuroscience",
            "difficulty_level": 4,
            "body": "Your brain is not a static machine; it is dynamic. Neuroplasticity is the brain's ability to reorganize itself by forming new neural connections throughout life. When you learn, neurons fire together and wire together.\n\nThis means failure is just data. By struggling with hard concepts, you stimulate myelin growth, which speeds up electrical signals and makes tasks feel easier over time.",
            "concepts": ["Neuroplasticity", "Synaptic Plasticity", "Myelin"],
            "learning_objective": "Understand how physical learning happens in the brain",
            "feynman_explanation": "Your brain is like a forest. When you learn something new, you carve out a path. The more you walk on it (practice), the wider and clearer the path becomes.",
            "quiz_questions": [
                {
                    "question": "What is neuroplasticity?",
                    "options": ["Plastic surgery for the brain", "The brain's ability to change and rewire", "A disease affecting nerves", "The rigid structure of adult brains"],
                    "correct_index": 1,
                    "explanation": "Neuroplasticity is the brain's capacity to form new connections and adjust its structure in response to learning or experience."
                }
            ]
        },
        {
            "title": "Introduction to Python Programming",
            "domain": "Programming",
            "difficulty_level": 2,
            "body": "Python is a high-level, readable programming language. It uses indentation to define code blocks instead of curly braces. Its simple syntax makes it perfect for beginners while power libraries make it a standard for AI and data science.",
            "concepts": ["Coding", "Python Syntax", "Variables"],
            "learning_objective": "Write a basic Python script",
            "feynman_explanation": "Python is like writing instructions for a robot in simple English. You just write what you want, keep the lines clean, and it does exactly what you typed.",
            "quiz_questions": [
                {
                    "question": "How does Python define blocks of code?",
                    "options": ["Using curly braces {}", "Using semicolons ;", "Using indentation", "Using brackets []"],
                    "correct_index": 2,
                    "explanation": "Python uses whitespace indentation to define code structure and blocks."
                }
            ]
        },
        {
            "title": "Category Theory: Monads in 5 Minutes",
            "domain": "Mathematics",
            "difficulty_level": 10,
            "body": "In functional programming, a Monad is a design pattern that wraps values, allowing sequential operations with side effects. Strictly speaking in category theory: 'a monad is just a monoid in the category of endofunctors, what's the problem?'\n\nIt consists of three parts: a type constructor, a unit function (wraps value), and a bind function (chains operations).",
            "concepts": ["Category Theory", "Monads", "Functional Programming"],
            "learning_objective": "Define a monad and functional chaining",
            "feynman_explanation": "A Monad is like a wrapper box for a toy. Instead of playing with the toy directly, you have special rules (functions) that let you change the toy inside the box without ever opening it yourself.",
            "quiz_questions": [
                {
                    "question": "What is a Monad in category theory and functional programming?",
                    "options": ["A single-threaded CPU", "A design pattern that wraps values and chains operations", "A type of database index", "A mathematical equation for loops"],
                    "correct_index": 1,
                    "explanation": "Monads wrap values and provide a bind mechanism to sequence calculations cleanly."
                }
            ]
        },
        {
            "title": "General Relativity: Gravity as Spacetime Curvature",
            "domain": "Physics",
            "difficulty_level": 7,
            "body": "Albert Einstein's General Relativity states that space and time are fused into a four-dimensional fabric called spacetime. Mass and energy curve this fabric. Gravity is not a pull force; it is objects moving along the curves of spacetime.\n\nAs physicist John Wheeler put it: 'Spacetime tells matter how to move; matter tells spacetime how to curve.'",
            "concepts": ["General Relativity", "Spacetime", "Gravity"],
            "learning_objective": "Describe gravity using general relativity",
            "feynman_explanation": "Imagine a heavy bowling ball sitting on a trampoline. It creates a deep dent. If you roll a small marble past it, the marble rolls into the dent. That dent is gravity.",
            "quiz_questions": [
                {
                    "question": "According to Einstein, what causes gravity?",
                    "options": ["Magnetic fields", "The pull of microscopic particles", "The curvature of spacetime by mass", "Centrifugal force"],
                    "correct_index": 2,
                    "explanation": "Massive objects warp the fabric of spacetime, and this bending is what we feel as gravity."
                }
            ]
        },
        {
            "title": "Microeconomics: Supply, Demand & Equilibrium",
            "domain": "Economics",
            "difficulty_level": 3,
            "body": "Supply and demand is the core model of market economics. Supply represents how much sellers are willing to provide, while Demand is how much buyers want. Equilibrium occurs where the two curves intersect.\n\nAt this intersection, the quantity supplied exactly equals the quantity demanded, establishing the market price.",
            "concepts": ["Supply and Demand", "Market Equilibrium", "Microeconomics"],
            "learning_objective": "Explain supply, demand, and equilibrium price",
            "feynman_explanation": "If a lot of kids want a toy, but there is only one toy (high demand, low supply), the price goes up. If there are too many toys and nobody wants them, the price goes down. The perfect middle point is equilibrium.",
            "quiz_questions": [
                {
                    "question": "What happens to the price of a product if supply is low and demand is high?",
                    "options": ["Price decreases", "Price increases", "Price stays the same", "Price drops to zero"],
                    "correct_index": 1,
                    "explanation": "Low supply coupled with high demand drives competition among buyers, causing prices to rise."
                }
            ]
        },
        {
            "title": "Socratic Method: The Art of Probing Questions",
            "domain": "Philosophy",
            "difficulty_level": 4,
            "body": "Developed by Socrates, this method is a form of cooperative argumentative dialogue. Instead of lecturing, you ask a series of analytical questions to stimulate critical thinking and expose logical flaws in the opponent's beliefs.",
            "concepts": ["Socratic Method", "Critical Thinking", "Philosophy"],
            "learning_objective": "Apply Socratic questioning in discourse",
            "feynman_explanation": "Instead of telling someone they are wrong, you ask them questions that make them realize their own mistakes. It helps them think things through for themselves.",
            "quiz_questions": [
                {
                    "question": "What is the primary tool used in the Socratic Method?",
                    "options": ["Lectures and slides", "Probing questions", "Debate timers", "Written essays"],
                    "correct_index": 1,
                    "explanation": "The Socratic Method relies on guided, step-by-step questioning to lead learners to logical conclusions."
                }
            ]
        }
    ]

    for item in items_to_seed:
        content = Content(
            creator_id=creator.id,
            title=item["title"],
            type=ContentType.REEL,
            domain=item["domain"],
            body=item["body"],
            difficulty_level=item["difficulty_level"],
            concepts=item["concepts"],
            learning_objective=item["learning_objective"],
            feynman_explanation=item["feynman_explanation"],
            quiz_questions=item["quiz_questions"],
            is_published=True,
            engagement_score=0.5,
            view_count=10,
            like_count=2
        )
        content.estimated_learning_value = 0.5 + (content.difficulty_level / 20)
        content.embedding_id = f"emb_{content.id}"  # Placeholder
        db.add(content)

    await db.commit()
    logger.info("✅ Seeding completed successfully!")
    return len(items_to_seed)

