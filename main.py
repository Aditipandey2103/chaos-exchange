from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text,select
from database import get_db
from models.company import Company
from schemas.company import CompanyOut
from models.user import User
from schemas.user import UserOut

app = FastAPI(title="Chaos Exchange API")

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

