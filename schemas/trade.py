from pydantic import BaseModel
import uuid
from datetime import datetime

class TradeOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    company_id: uuid.UUID
    trade_type: str
    quantity: int
    price_at_trade: float
    total_value: float
    executed_at: datetime

    class Config:
        from_attributes = True