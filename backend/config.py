from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "KnowledgeVerse"
    APP_ENV: str = "development"
    APP_SECRET_KEY: str

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./knowledgeverse.db"

    # AI
    GOOGLE_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # Cloud AI (Groq)
    AI_API_BASE_URL: str = "https://api.groq.com/openai/v1"
    AI_MODEL: str = "llama-3.1-8b-instant"

    # LM Studio (Gemma 4 E2B — local inference)
    LM_STUDIO_URL: str = "http://127.0.0.1:1234"  # LM Studio default port
    LM_STUDIO_MODEL: str = "gemma-2-4b-it"        # Model name as shown in LM Studio
    LM_STUDIO_ENABLED: bool = False                # Set False to skip LM Studio

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days

    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # CORS
    ALLOWED_ORIGINS: List[str] = ["*"]

    # Features
    ENABLE_AI_AGENTS: bool = True
    ENABLE_KNOWLEDGE_GRAPH: bool = True

    class Config:
        env_file = "../.env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
