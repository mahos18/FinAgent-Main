from pydantic import BaseModel

class BudgetBase(BaseModel):
    category: str
    amount: float
    

class BudgetCreate(BudgetBase):
    pass

class BudgetOut(BudgetBase):
    id: int
    class Config:
        from_attributes = True
