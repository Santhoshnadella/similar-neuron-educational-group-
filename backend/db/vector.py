import logging
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from sentence_transformers import SentenceTransformer
import uuid

logger = logging.getLogger(__name__)

class VectorDB:
    def __init__(self):
        self.client = None
        self.encoder = None
        self.embedding_size = 384
        self.collection_name = "content_embeddings"
            
    def _lazy_init(self):
        if self.client is not None:
            return
        try:
            logger.info("Lazily initializing VectorDB (Qdrant & SentenceTransformer)...")
            self.client = QdrantClient(path="qdrant_data")
            self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
            self._ensure_collection()
            logger.info("Vector DB initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize VectorDB: {e}")
            self.client = None
            self.encoder = None
            
    def _ensure_collection(self):
        if not self.client:
            return
            
        collections = self.client.get_collections()
        exists = any(c.name == self.collection_name for c in collections.collections)
        
        if not exists:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=self.embedding_size, distance=Distance.COSINE),
            )
            
    def add_content(self, content_id: str, text: str) -> str:
        """Embeds text and adds it to Qdrant. Returns the Point ID."""
        self._lazy_init()
        if not self.client or not text:
            return None
            
        embedding = self.encoder.encode(text).tolist()
        point_id = str(uuid.uuid4())
        
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload={"content_id": content_id, "text": text[:500]}
                )
            ]
        )
        return point_id
 
    def search(self, query: str, limit: int = 5):
        """Searches for similar content in Qdrant."""
        self._lazy_init()
        if not self.client or not query:
            return []
            
        query_vector = self.encoder.encode(query).tolist()
        
        search_result = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit
        )
        
        return [{"content_id": hit.payload["content_id"], "score": hit.score} for hit in search_result]

vector_db = VectorDB()
