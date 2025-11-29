from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth_bearer import get_current_user

from app.schemas.transaction import TransactionCreate, TransactionOut, TransactionUpdate
from app.services.transaction_service import (
    create_transaction, list_transactions, get_transaction,
    update_transaction, delete_transaction,
    monthly_summary, category_summary
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=TransactionOut)
async def add_transaction(
    payload: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = current_user.id     # ✅ FIXED
    return await create_transaction(db, user_id, payload)


@router.get("/", response_model=list[TransactionOut])
async def get_all_transactions(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = current_user.id     # ✅ FIXED
    return await list_transactions(db, user_id)


@router.patch("/{tx_id}", response_model=TransactionOut)
async def edit_transaction(
    tx_id: int,
    payload: TransactionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    tx = await get_transaction(db, tx_id)
    if not tx or tx.user_id != current_user.id:   # ✅ FIXED
        raise HTTPException(status_code=404, detail="Transaction not found")

    return await update_transaction(db, tx, payload.dict(exclude_unset=True))


@router.delete("/{tx_id}")
async def remove_transaction(
    tx_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    tx = await get_transaction(db, tx_id)
    if not tx or tx.user_id != current_user.id:   # ✅ FIXED
        raise HTTPException(status_code=404, detail="Transaction not found")

    await delete_transaction(db, tx)
    return {"deleted": True}


@router.get("/summary/monthly")
async def monthly(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await monthly_summary(db, current_user.id)   # ✅ FIXED


@router.get("/summary/categories")
async def categories(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return await category_summary(db, current_user.id)  # ✅ FIXED
