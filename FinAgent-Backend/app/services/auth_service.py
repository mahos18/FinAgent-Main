from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings

# Use Argon2 (strong & compatible)
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7


# ---------------------------------------------------------
# PASSWORD HASHING
# ---------------------------------------------------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ---------------------------------------------------------
# AUTHENTICATE USER
# ---------------------------------------------------------
async def authenticate_user(session: AsyncSession, email: str, password: str):
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    if not user:
        return None

    # Important: use user.hashed_password (correct DB column)
    if not verify_password(password, user.hashed_password):
        return None

    return user


# ---------------------------------------------------------
# JWT TOKENS
# ---------------------------------------------------------
def create_access_token(data: dict):
    """ Generate access token with 15 min expiry """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,       # FIXED
        algorithm="HS256"
    )


def create_refresh_token(data: dict):
    """ Generate refresh token with 7-day expiry """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,       # FIXED
        algorithm="HS256"
    )
