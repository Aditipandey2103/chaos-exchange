import uuid
from sqlalchemy import String, Numeric, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base

class Company(Base):
    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100))
    ticker: Mapped[str] = mapped_column(String(10))
    description: Mapped[str] = mapped_column(Text, nullable=True)
    current_price: Mapped[float] = mapped_column(Numeric(12, 2))
    created_at: Mapped[str] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())