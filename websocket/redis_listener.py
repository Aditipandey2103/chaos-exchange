
import asyncio
import json
from redis_client import redis_client
from websocket.manager import manager

async def redis_listener():
    
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("price_updates")
    
    async for message in pubsub.listen():
        
        if message["type"] == "message":
            data = json.loads(message["data"])
            await manager.broadcast(data)