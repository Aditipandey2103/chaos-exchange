import uuid
from sqlalchemy import Integer, Numeric, String, TIMESTAMP, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base

class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id"))
    trade_type: Mapped[str] = mapped_column(String(4))
    quantity: Mapped[int] = mapped_column(Integer)
    price_at_trade: Mapped[float] = mapped_column(Numeric(12, 2))
    total_value: Mapped[float] = mapped_column(Numeric(14, 2))
    executed_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("trade_type IN ('buy', 'sell')", name="ck_trade_type"),
        CheckConstraint("quantity > 0", name="ck_quantity_positive"),
    )
    