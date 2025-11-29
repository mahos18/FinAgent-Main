from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.core.auth_bearer import get_current_user
from app.models.user import User
from app.schemas.user import UserOut

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def read_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserOut)
async def update_me(payload: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = update(User).where(User.id == current_user.id).values(**payload).execution_options(synchronize_session="fetch")
    await db.execute(stmt)
    await db.commit()
    q = await db.execute(select(User).where(User.id == current_user.id))
    user = q.scalar_one()
    return user
