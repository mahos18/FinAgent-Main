from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TransactionBase(BaseModel):
    amount: float
    type: str  # debit / credit
    merchant: Optional[str] = None
    category: Optional[str] = None
    date: Optional[datetime] = None
    source: Optional[str] = "manual"

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    merchant: Optional[str] = None
    category: Optional[str] = None
    date: Optional[datetime] = None

class TransactionOut(TransactionBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
