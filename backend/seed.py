import asyncio
import logging
from db.database import engine, Base, AsyncSessionLocal
from content.service import seed_db
from db.qdrant import get_qdrant_client, CONTENT_COLLECTION

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def reset_and_seed():
    logger.info("Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    logger.info("Recreating Qdrant collection...")
    client = get_qdrant_client()
    try:
        client.delete_collection(collection_name=CONTENT_COLLECTION)
    except Exception as e:
        logger.warning(f"Failed to delete collection (might not exist): {e}")
        
    from db.qdrant import init_qdrant
    init_qdrant()
    
    logger.info("Seeding database with fresh embedded data...")
    async with AsyncSessionLocal() as session:
        await seed_db(session)
        
    logger.info("Done! The database is now ready for testing.")

if __name__ == "__main__":
    asyncio.run(reset_and_seed())
