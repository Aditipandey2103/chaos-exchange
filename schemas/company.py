from pydantic import BaseModel
import uuid

class CompanyOut(BaseModel):
    id: uuid.UUID
    name: str
    ticker: str
    description: str | None
    current_price: float

    class Config:
        from_attributes = True
        