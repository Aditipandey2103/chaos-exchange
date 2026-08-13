from pydantic import BaseModel
import uuid

class TradeRequest(BaseModel):
    user_id: uuid.UUID
    company_id: uuid.UUID
    quantity: int
    