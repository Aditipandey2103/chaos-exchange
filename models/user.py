import uuid
from sqlalchemy import String, Numeric, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    cash_balance: Mapped[float] = mapped_column(Numeric(14, 2), default=100000.00)
    created_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())