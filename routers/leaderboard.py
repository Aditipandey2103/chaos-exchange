from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.user import User
from models.holding import Holding
from models.company import Company
from pydantic import BaseModel
import uuid


router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


class LeaderboardEntry(BaseModel):
    user_id: uuid.UUID
    username: str
    net_worth: float


@router.get("", response_model=list[LeaderboardEntry])
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    # 1. Get all users
    result = await db.execute(select(User))
    users = result.scalars().all()

    # 2. Get all holdings joined with companies (one query, not per-user)
    result = await db.execute(
        select(Holding, Company)
        .join(Company, Holding.company_id == Company.id)
        .where(Holding.shares_owned > 0)
    )
    rows = result.all()

    # 3. Build a lookup: user_id -> total holdings value
    holdings_value_by_user = {}
    for holding, company in rows:
        value = float(company.current_price) * holding.shares_owned
        holdings_value_by_user[holding.user_id] = holdings_value_by_user.get(holding.user_id, 0) + value

    # 4. Calculate net worth per user
    leaderboard = []
    for user in users:
        holdings_value = holdings_value_by_user.get(user.id, 0)
        net_worth = float(user.cash_balance) + holdings_value
        leaderboard.append(LeaderboardEntry(
            user_id=user.id,
            username=user.username,
            net_worth=round(net_worth, 2),
        ))

    # 5. Sort by net worth, highest first
    leaderboard.sort(key=lambda entry: entry.net_worth, reverse=True)

    return leaderboard