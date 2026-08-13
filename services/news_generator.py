import json
import random
from groq import Groq
import os
from dotenv import load_dotenv
from sqlalchemy import select
from database import async_session
from models.company import Company
from services.pricing import calculate_new_price
from redis_client import redis_client

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are a news headline generator for a fictional stock market game
called Chaos Exchange. Companies are absurd and fictional. Your job is to generate a
short, funny, punchy fake news headline about something happening to a specific company
today, and classify whether it's good or bad news for the company's stock price.

Respond ONLY with valid JSON, no other text, in this exact format:
{
  "headline": "string, under 15 words, punchy and funny",
  "sentiment": "positive" or "negative",
  "severity": a number from 1 to 5
}
"""


async def generate_news_event():
    async with async_session() as db:
        # 1. Pick a random company
        result = await db.execute(select(Company))
        companies = result.scalars().all()
        if not companies:
            return
        company = random.choice(companies)

        # 2. Call the LLM
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Company name: {company.name}\nDescription: {company.description}\n\nGenerate one headline."}
                ],
                temperature=0.9,
                response_format={"type": "json_object"},
            )
            news_data = json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f">>> NEWS GENERATION FAILED: {e}")
            return

        # 3. Apply price impact using existing pricing logic
        trade_type = "buy" if news_data["sentiment"] == "positive" else "sell"
        fake_quantity = news_data["severity"] * 10  # reuse calculate_new_price's quantity-based formula
        new_price = calculate_new_price(company.current_price, fake_quantity, trade_type)

        company.current_price = new_price
        await db.commit()

        # 4. Update Redis cache + broadcast
        await redis_client.set(f"price:{company.ticker}", str(new_price))
        await redis_client.publish("price_updates", json.dumps({
            "ticker": company.ticker,
            "price": new_price,
            "headline": news_data["headline"],
            "sentiment": news_data["sentiment"],
        }))

        print(f">>> NEWS: {company.ticker} - {news_data['headline']} ({news_data['sentiment']}) -> {new_price}")
        