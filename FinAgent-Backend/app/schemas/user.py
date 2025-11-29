from pydantic import BaseModel, EmailStr,Field
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: str | None = None

class UserCreate(UserBase):
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    occupation: Optional[str] = "unspecified"
    monthly_income: Optional[float] = 0

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    occupation: Optional[str] = Field(default=None)
    monthlyIncome: Optional[int] = Field(default=None)
    is_active: bool

    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
