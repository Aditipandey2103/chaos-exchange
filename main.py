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
from redis_client import redis_client
from fastapi import WebSocket, WebSocketDisconnect
from websocket.manager import manager
from websocket.redis_listener import redis_listener

app = FastAPI(title="Chaos Exchange API")
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(redis_listener())
app.include_router(trading.router)

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
    print(">>> WEBSOCKET REQUEST RECEIVED")

    await manager.connect(websocket)

    print(">>> WEBSOCKET ACCEPTED")

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(">>> WEBSOCKET DISCONNECTED")
