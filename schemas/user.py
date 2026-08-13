from pydantic import BaseModel
import uuid

class UserOut(BaseModel):
    id: uuid.UUID
    username: str
    cash_balance: float

    class Config:
        from_attributes = True