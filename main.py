from fastapi import FastAPI, Depends
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text,select
from database import get_db
from models.company import Company
from schemas.company import CompanyOut
from models.user import User
from schemas.user import UserOut
from routers import trading
from routers import portfolio
from routers import leaderboard
from redis_client import redis_client
from fastapi import WebSocket, WebSocketDisconnect
from websocket.manager import manager
from websocket.redis_listener import redis_listener
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.news_generator import generate_news_event


scheduler = AsyncIOScheduler()#for news generator
app = FastAPI(title="Chaos Exchange API")
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(redis_listener())
    scheduler.add_job(generate_news_event, 'interval', minutes=2)
    scheduler.start()

app.include_router(trading.router)
app.include_router(portfolio.router)
app.include_router(leaderboard.router)

@app.get("/")
async def root():
    return {"message": "Chaos Exchange API is alive"}

@app.get("/db-check")
async def db_check(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT COUNT(*) FROM companies"))
    count = result.scalar()
    return {"companies_in_db": count}

@app.get("/companies", response_model=list[CompanyOut])
async def get_companies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company))
    companies = result.scalars().all()
    return companies

@app.get("/users",response_model=list[UserOut])
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users

@app.get("/redis-check")
async def redis_check():
    await redis_client.set("test_key", "chaos exchange is alive")
    value = await redis_client.get("test_key")
    return {"redis_says": value}

@app.websocket("/ws/market")
async def websocket_endpoint(websocket: WebSocket):
    

    await manager.connect(websocket)

    

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        
