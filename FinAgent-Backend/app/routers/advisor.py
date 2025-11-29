from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.conversation import Conversation
from app.models.user import User
from app.core.auth_bearer import get_current_user
from app.schemas.conversation import MessageCreate, AdvisorReply

router = APIRouter(prefix="/advisor", tags=["advisor"])


# USER → ADVISOR MESSAGE
@router.post("/message")
async def send_message(
    data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_msg = Conversation(
        user_id=current_user.id,
        sender="user",
        message=data.message
    )

    db.add(new_msg)
    await db.commit()
    await db.refresh(new_msg)

    return {
        "message": "Message sent!",
        "data": {"id": new_msg.id, "text": new_msg.message}
    }


# ADVISOR → USER REPLY
@router.post("/reply/{user_id}")
async def advisor_reply(
    user_id: int,
    data: AdvisorReply,
    db: AsyncSession = Depends(get_db)
):
    # check user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reply = Conversation(
        user_id=user_id,
        sender="advisor",
        message=data.reply
    )

    db.add(reply)
    await db.commit()
    await db.refresh(reply)

    return {"message": "Reply saved!", "reply": reply.message}
