import os
import logging
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from config import settings

logger = logging.getLogger(__name__)

# Initialize local Qdrant client
QDRANT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "qdrant_data")
client = QdrantClient(path=QDRANT_PATH)

CONTENT_COLLECTION = "content_embeddings"
EMBEDDING_SIZE = 384  # size of all-MiniLM-L6-v2 embeddings

def init_qdrant():
    """Ensure the collection exists."""
    collections = client.get_collections().collections
    exists = any(c.name == CONTENT_COLLECTION for c in collections)
    if not exists:
        logger.info(f"Creating Qdrant collection: {CONTENT_COLLECTION}")
        client.create_collection(
            collection_name=CONTENT_COLLECTION,
            vectors_config=VectorParams(size=EMBEDDING_SIZE, distance=Distance.COSINE),
        )
    else:
        logger.info(f"Qdrant collection {CONTENT_COLLECTION} already exists.")

def get_qdrant_client() -> QdrantClient:
    return client
