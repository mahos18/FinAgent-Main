from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt

from app.core.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest
from app.schemas.user import UserCreate, UserOut,UserProfileUpdate
from app.core.auth_bearer import get_current_user
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    hash_password
)
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
async def register_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == data.email))
    existing = result.scalars().first()

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    # FIXED: use hashed_password NOT password_hash
    new_user = User(
        email=data.email,
        name=data.name,
        hashed_password=hash_password(data.password),
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user

@router.patch("/updateProfile")
async def update_profile(
    data: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)   # user from JWT
):
    # Fetch the user row
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update only provided fields
    update_fields = data.dict(exclude_unset=True)

    for key, value in update_fields.items():
        setattr(user, key, value)

    await db.commit()
    await db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "updated": update_fields
    }



@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, data.email, data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access = create_access_token({"sub": str(user.id)})
    refresh = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        token_type="bearer"
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(req: RefreshRequest):
    try:
        payload = jwt.decode(
            req.refresh_token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    new_access = create_access_token({"sub": user_id})
    new_refresh = create_refresh_token({"sub": user_id})

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer"
    )
