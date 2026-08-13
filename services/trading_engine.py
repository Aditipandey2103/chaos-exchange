from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import User
from models.company import Company
from models.holding import Holding
from models.trade import Trade
from services.pricing import calculate_new_price
from exception import InsufficientFundsError, InsufficientSharesError
import uuid
import json
from redis_client import redis_client


async def execute_buy(user_id: uuid.UUID, company_id: uuid.UUID, quantity: int, db: AsyncSession):
    # 1. Lock the company row so no other trade touches it mid-calculation
    result = await db.execute(
        select(Company).where(Company.id == company_id).with_for_update()
    )
    company = result.scalar_one()

    # 2. Get the user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()

    # 3. Calculate cost and check funds
    total_cost = float(company.current_price) * quantity
    if float(user.cash_balance) < total_cost:
        raise InsufficientFundsError("Not enough cash for this trade")

    # 4. Deduct cash
    user.cash_balance = float(user.cash_balance) - total_cost

    # 5. Update or create holding
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id, Holding.company_id == company_id)
    )
    holding = result.scalar_one_or_none()

    if holding:
        old_total = float(holding.avg_buy_price) * holding.shares_owned
        new_total = old_total + total_cost
        holding.shares_owned += quantity
        holding.avg_buy_price = round(new_total / holding.shares_owned, 2)
    else:
        holding = Holding(
            user_id=user_id,
            company_id=company_id,
            shares_owned=quantity,
            avg_buy_price=company.current_price,
        )
        db.add(holding)

    # 6. Calculate and apply new price
    new_price = calculate_new_price(company.current_price, quantity, "buy")
    company.current_price = new_price

    # 7. Log the trade
    trade = Trade(
        user_id=user_id,
        company_id=company_id,
        trade_type="buy",
        quantity=quantity,
        price_at_trade=new_price,
        total_value=total_cost,
    )
    db.add(trade)

    # 8. Commit everything together — atomic
    await db.commit()
    await redis_client.set(f"price:{company.ticker}", str(new_price))
    await redis_client.publish("price_updates", json.dumps({
        "ticker": company.ticker,
        "price": new_price,
    }))

    return {
        "new_price": new_price,
        "shares_owned": holding.shares_owned,
        "cash_balance": float(user.cash_balance),
    }
async def execute_sell(user_id: uuid.UUID, company_id: uuid.UUID, quantity: int, db: AsyncSession):
    # 1. Lock the company row
    result = await db.execute(
        select(Company).where(Company.id == company_id).with_for_update()
    )
    company = result.scalar_one()

    # 2. Get the user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()

    # 3. Check the user actually owns enough shares to sell
    result = await db.execute(
        select(Holding).where(Holding.user_id == user_id, Holding.company_id == company_id)
    )
    holding = result.scalar_one_or_none()

    if not holding or holding.shares_owned < quantity:
        raise InsufficientSharesError("Not enough shares to sell")

    # 4. Calculate proceeds
    total_value = float(company.current_price) * quantity

    # 5. Add cash to user
    user.cash_balance = float(user.cash_balance) + total_value

    # 6. Reduce holding
    holding.shares_owned -= quantity
    if holding.shares_owned == 0:
        holding.avg_buy_price = 0  # reset, they own nothing now

    # 7. Calculate and apply new price (price drops on selling)
    new_price = calculate_new_price(company.current_price, quantity, "sell")
    company.current_price = new_price

    # 8. Log the trade
    trade = Trade(
        user_id=user_id,
        company_id=company_id,
        trade_type="sell",
        quantity=quantity,
        price_at_trade=new_price,
        total_value=total_value,
    )
    db.add(trade)

    # 9. Commit atomically
    await db.commit()
    await redis_client.set(f"price:{company.ticker}", str(new_price))
    await redis_client.publish("price_updates", json.dumps({
        "ticker": company.ticker,
        "price": new_price,
    }))

    return {
        "new_price": new_price,
        "shares_owned": holding.shares_owned,
        "cash_balance": float(user.cash_balance),
    }
