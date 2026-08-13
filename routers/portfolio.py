from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from models.holding import Holding
from models.company import Company
from schemas.portfolio import PortfolioOut, HoldingDetail
import uuid

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/{user_id}", response_model=PortfolioOut)
async def get_portfolio(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    # 1. Get the user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Get all holdings for this user, joined with company info
    result = await db.execute(
        select(Holding, Company)
        .join(Company, Holding.company_id == Company.id)
        .where(Holding.user_id == user_id, Holding.shares_owned > 0)
    )
    rows = result.all()

    # 3. Build the holdings list with gain/loss calculated
    holdings_detail = []
    total_holdings_value = 0.0

    for holding, company in rows:
        current_price = float(company.current_price)
        avg_buy_price = float(holding.avg_buy_price)
        current_value = current_price * holding.shares_owned
        invested_value = avg_buy_price * holding.shares_owned
        gain_loss = current_value - invested_value
        gain_loss_percent = (gain_loss / invested_value * 100) if invested_value > 0 else 0

        holdings_detail.append(HoldingDetail(
            company_id=company.id,
            company_name=company.name,
            ticker=company.ticker,
            shares_owned=holding.shares_owned,
            avg_buy_price=avg_buy_price,
            current_price=current_price,
            current_value=round(current_value, 2),
            gain_loss=round(gain_loss, 2),
            gain_loss_percent=round(gain_loss_percent, 2),
        ))

        total_holdings_value += current_value

    # 4. Calculate net worth
    cash_balance = float(user.cash_balance)
    net_worth = cash_balance + total_holdings_value

    return PortfolioOut(
        user_id=user.id,
        cash_balance=cash_balance,
        holdings=holdings_detail,
        total_holdings_value=round(total_holdings_value, 2),
        net_worth=round(net_worth, 2),
    )