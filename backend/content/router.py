from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from db.database import get_db
from db.models import User, Content
from auth.dependencies import get_current_user
from content.schemas import ContentCreate, ContentResponse, ContentListResponse
from content import service as content_service

router = APIRouter()


@router.post("/seed", status_code=status.HTTP_200_OK)
async def seed_data(db: AsyncSession = Depends(get_db)):
    """Seed database with test users and educational content."""
    try:
        count = await content_service.seed_db(db)
        return {
            "status": "success",
            "message": f"Successfully seeded {count} educational items and profiles."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database seeding failed: {str(e)}"
        )


@router.get("/", response_model=ContentListResponse)
async def list_content(db: AsyncSession = Depends(get_db)):
    stmt = select(Content).where(Content.is_published == True).order_by(desc(Content.created_at)).limit(50)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return ContentListResponse(items=[ContentResponse.model_validate(c) for c in items], total=len(items))


@router.post("/", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def create_content(
    data: ContentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await content_service.create_content(db, data, current_user.id)
    return ContentResponse.model_validate(content)


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(content_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Content).where(Content.id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    # Increment view count
    content.view_count += 1
    await db.commit()
    return ContentResponse.model_validate(content)


@router.post("/{content_id}/like")
async def like_content(
    content_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Content).where(Content.id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    content.like_count += 1
    content.engagement_score = min(1.0, content.engagement_score + 0.01)
    await db.commit()
    return {"liked": True, "like_count": content.like_count}
