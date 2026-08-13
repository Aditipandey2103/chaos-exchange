from pydantic import BaseModel
import uuid

class HoldingDetail(BaseModel):
    company_id: uuid.UUID
    company_name: str
    ticker: str
    shares_owned: int
    avg_buy_price: float
    current_price: float
    current_value: float
    gain_loss: float
    gain_loss_percent: float

class PortfolioOut(BaseModel):
    user_id: uuid.UUID
    cash_balance: float
    holdings: list[HoldingDetail]
    total_holdings_value: float
    net_worth: float