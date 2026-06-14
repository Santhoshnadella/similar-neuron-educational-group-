import asyncio
import uuid
import os
import sys

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text

# Ensure backend path is in sys.path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.models import User, Content, ContentType, Base
from config import settings

async def seed_data():
    db_url = settings.DATABASE_URL
    connect_args = {"timeout": 10}
    if "?" in db_url:
        base_url, query_params = db_url.split("?", 1)
        if "sslmode=require" in query_params or "ssl=require" in query_params:
            connect_args["ssl"] = True
        db_url = base_url
    if "neon.tech" in db_url:
        connect_args["ssl"] = True

    print(f"Connecting to {db_url.split('@')[-1]}...")
    engine = create_async_engine(
        db_url, 
        echo=False,
        connect_args=connect_args
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("Created all database tables!")

    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        # Create a system creator
        sys_user_id = str(uuid.uuid4())
        creator = User(
            id=sys_user_id,
            username="KnowledgeVerse_Official",
            email="hello@knowledgeverse.ai",
            is_creator=True,
            bio="The official account of KnowledgeVerse. Curating the best educational content.",
        )
        
        # Check if user already exists
        existing_user_query = await session.execute(text("SELECT id FROM users WHERE email='hello@knowledgeverse.ai'"))
        existing_user = existing_user_query.fetchone()
        
        if existing_user:
            sys_user_id = existing_user[0]
            print("Official creator account already exists.")
        else:
            session.add(creator)
            await session.commit()
            print("Created official creator account.")

        # Seed content
        reels = [
            Content(
                creator_id=sys_user_id,
                title="The Quantum World Explained in 60s",
                type=ContentType.REEL,
                domain="Physics",
                body="Quantum mechanics is the study of the very small. Unlike the predictable world of classical physics, quantum particles exist in probabilities. This reel breaks down superposition and entanglement.",
                difficulty_level=6,
                estimated_learning_value=8.5,
                concepts=["Quantum Mechanics", "Superposition", "Entanglement"],
                learning_objective="Understand the difference between classical and quantum states.",
            ),
            Content(
                creator_id=sys_user_id,
                title="Roman Architecture: The Secret of Concrete",
                type=ContentType.REEL,
                domain="History",
                body="Why do Roman structures like the Pantheon still stand after 2,000 years, while modern concrete crumbles in decades? The secret lies in volcanic ash and self-healing chemical properties.",
                difficulty_level=4,
                estimated_learning_value=7.2,
                concepts=["Architecture", "Roman Empire", "Material Science"],
                learning_objective="Learn how ancient Roman concrete's self-healing properties work.",
            ),
            Content(
                creator_id=sys_user_id,
                title="Big O Notation for Visual Learners",
                type=ContentType.REEL,
                domain="Computer Science",
                body="Stop memorizing sorting algorithms. Understand *why* they are fast or slow. Big O notation measures how an algorithm scales as data grows. Here is a visual guide to O(n), O(log n), and O(n^2).",
                difficulty_level=5,
                estimated_learning_value=9.0,
                concepts=["Algorithms", "Big O Notation", "Time Complexity"],
                learning_objective="Visualize algorithmic scaling with real-world analogies.",
            )
        ]

        # Insert content
        for reel in reels:
            session.add(reel)
            
        await session.commit()
        print(f"Successfully seeded {len(reels)} Knowledge Reels into the database!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_data())
