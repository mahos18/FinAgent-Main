from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, DateTime
from app.models.transactions import Transaction
from datetime import datetime


async def create_transaction(db: AsyncSession, user_id: int, data):
    tx = Transaction(
        amount=data.amount,
        type=data.type,
        merchant=data.merchant,
        category=data.category,
        date=data.date or datetime.utcnow(),
        source=data.source,
        user_id=user_id
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx


async def list_transactions(db: AsyncSession, user_id: int):
    q = (
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.date.desc())
    )
    res = await db.execute(q)
    return res.scalars().all()


async def get_transaction(db: AsyncSession, tx_id: int):
    q = select(Transaction).where(Transaction.id == tx_id)
    res = await db.execute(q)
    return res.scalar_one_or_none()


async def update_transaction(db: AsyncSession, tx: Transaction, updates: dict):
    for key, value in updates.items():
        if value is not None:
            setattr(tx, key, value)

    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx


async def delete_transaction(db: AsyncSession, tx: Transaction):
    await db.delete(tx)
    await db.commit()
    return True


async def monthly_summary(db: AsyncSession, user_id: int):
    month_trunc = func.date_trunc('month', Transaction.date)

    q = (
        select(
            month_trunc.label("month"),
            func.sum(Transaction.amount).label("total")
        )
        .where(Transaction.user_id == user_id)
        .group_by(month_trunc)
        .order_by(month_trunc.desc())
    )

    result = await db.execute(q)
    rows = result.all()

    summary = []
    for row in rows:
        month = row.month
        if hasattr(month, "isoformat"):
            month = month.isoformat()

        summary.append({
            "month": month,
            "total": float(row.total)
        })

    return summary


async def category_summary(db: AsyncSession, user_id: int):
    q = (
        select(
            Transaction.category,
            func.sum(Transaction.amount).label("total")
        )
        .where(Transaction.user_id == user_id)
        .group_by(Transaction.category)
        .order_by(func.sum(Transaction.amount).desc())
    )

    res = await db.execute(q)
    rows = res.all()

    return [
        {
            "category": r.category or "Uncategorized",
            "total": float(r.total)
        }
        for r in rows
    ]
