from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas.goal import GoalCreate, GoalOut
from app.core.database import get_db
from app.models.goal import Goal
from app.core.auth_bearer import get_current_user

router = APIRouter(prefix="/goals", tags=["goals"])

@router.post("/", response_model=GoalOut)
async def add_goal(
    data: GoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    goal = Goal(user_id=current_user.id, **data.dict())
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return goal


@router.get("/", response_model=list[GoalOut])
async def get_goals(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = await db.execute(
        select(Goal).where(Goal.user_id == current_user.id)
    )
    return result.scalars().all()


@router.put("/{goal_id}", response_model=GoalOut)
async def update_goal(
    goal_id: int,
    data: GoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = await db.execute(
        Goal.__table__.update()
        .where(Goal.id == goal_id, Goal.user_id == current_user.id)
        .values(**data.dict())
        .returning(Goal)
    )
    updated = result.fetchone()
    await db.commit()

    if not updated:
        raise HTTPException(404, "Goal not found")

    return updated


@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    await db.execute(
        Goal.__table__.delete().where(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        )
    )
    await db.commit()
    return {"message": "Goal deleted"}
