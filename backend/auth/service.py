from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from config import settings
from db.models import User, CognitiveProfile
from auth.schemas import UserCreate, OAuthRequest

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    # Create cognitive profile first
    profile = CognitiveProfile()
    db.add(profile)
    await db.flush()

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        cognitive_profile_id=profile.id,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    user = await get_user_by_email(db, email)
    if not user or not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def oauth_login(db: AsyncSession, oauth_data: OAuthRequest) -> User:
    """Handle OAuth login — create or retrieve user."""
    if oauth_data.provider == "google":
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {oauth_data.access_token}"},
            )
            info = resp.json()
        email = info.get("email")
        name = info.get("name", email.split("@")[0])
        avatar = info.get("picture")
        oauth_id = info.get("sub")
    else:
        raise ValueError(f"Unsupported OAuth provider: {oauth_data.provider}")

    # Check if user exists
    user = await get_user_by_email(db, email)
    if user:
        return user

    # Create new user from OAuth
    profile = CognitiveProfile()
    db.add(profile)
    await db.flush()

    # Generate unique username
    base_username = name.lower().replace(" ", "_")[:30]
    username = base_username
    counter = 1
    while await get_user_by_username(db, username):
        username = f"{base_username}_{counter}"
        counter += 1

    user = User(
        username=username,
        email=email,
        avatar_url=avatar,
        oauth_provider=oauth_data.provider,
        oauth_id=oauth_id,
        cognitive_profile_id=profile.id,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user
