from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "KnowledgeVerse"
    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "dev-secret-key-change-in-production"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./knowledgeverse.db"

    # AI
    GOOGLE_API_KEY: str = ""

    # LM Studio (Gemma 4 E2B — local inference)
    LM_STUDIO_URL: str = "http://127.0.0.1:1234"  # LM Studio default port
    LM_STUDIO_MODEL: str = "gemma-2-4b-it"        # Model name as shown in LM Studio
    LM_STUDIO_ENABLED: bool = True                # Set False to skip LM Studio

    # JWT
    JWT_SECRET: str = "jwt-secret-key-minimum-32-characters-long!!"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days

    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Features
    ENABLE_AI_AGENTS: bool = True
    ENABLE_KNOWLEDGE_GRAPH: bool = True

    class Config:
        env_file = "../.env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
