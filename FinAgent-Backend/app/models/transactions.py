from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String(10), nullable=False)  # debit | credit
    merchant = Column(String, nullable=True)
    category = Column(String, nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    source = Column(String, nullable=False, default="manual")  # manual | csv | sms

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
