from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas.trading import TradeRequest
from services.trading_engine import execute_buy, execute_sell
from exception import InsufficientFundsError, InsufficientSharesError

router = APIRouter(prefix="/trade", tags=["trading"])


@router.post("/buy")
async def buy(request: TradeRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await execute_buy(request.user_id, request.company_id, request.quantity, db)
        return result
    except InsufficientFundsError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/sell")
async def sell(request: TradeRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await execute_sell(request.user_id, request.company_id, request.quantity, db)
        return result
    except InsufficientSharesError as e:
        raise HTTPException(status_code=400, detail=str(e))