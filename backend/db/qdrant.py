import os
import logging
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from config import settings

logger = logging.getLogger(__name__)

_client = None

def get_qdrant_client() -> QdrantClient:
    global _client
    if _client is None:
        QDRANT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "qdrant_data")
        _client = QdrantClient(path=QDRANT_PATH)
    return _client

CONTENT_COLLECTION = "content_embeddings"
EMBEDDING_SIZE = 384  # size of all-MiniLM-L6-v2 embeddings

def init_qdrant():
    """Ensure the collection exists."""
    client = get_qdrant_client()
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
