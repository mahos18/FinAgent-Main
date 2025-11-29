from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas.budget import BudgetCreate, BudgetOut
from app.core.database import get_db
from app.models.budget import Budget
from app.core.auth_bearer import get_current_user

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.post("/", response_model=BudgetOut)
async def add_budget(
    data: BudgetCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_budget = Budget(user_id=current_user.id, **data.dict())
    db.add(new_budget)
    await db.commit()
    await db.refresh(new_budget)
    return new_budget


@router.get("/", response_model=list[BudgetOut])
async def get_budgets(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = await db.execute(
        select(Budget).where(Budget.user_id == current_user.id)
    )
    return result.scalars().all()


@router.put("/{budget_id}", response_model=BudgetOut)
async def update_budget(
    budget_id: int,
    data: BudgetCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = await db.execute(
        Budget.__table__.update()
        .where(Budget.id == budget_id, Budget.user_id == current_user.id)
        .values(**data.dict())
        .returning(Budget)
    )
    updated = result.fetchone()
    await db.commit()

    if not updated:
        raise HTTPException(404, "Budget not found")

    return updated


@router.delete("/{budget_id}")
async def delete_budget(
    budget_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    await db.execute(
        Budget.__table__.delete().where(
            Budget.id == budget_id,
            Budget.user_id == current_user.id
        )
    )
    await db.commit()
    return {"message": "Budget deleted"}
