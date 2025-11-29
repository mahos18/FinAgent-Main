from pydantic import BaseModel
from datetime import date

class GoalBase(BaseModel):
    title: str
    target_amount: float
    saved_amount: float | None = 0
    deadline: date | None = None

class GoalCreate(GoalBase):
    pass

class GoalOut(GoalBase):
    id: int
    class Config:
        from_attributes = True
