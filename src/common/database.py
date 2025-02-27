from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models.models import Team,User,ResetToken
from config import settings
from urllib.parse import urlparse


async def init_db():
    """Initialize MongoDB connection and register models."""
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    # Extract the database name dynamically
    db_name = urlparse(settings.DATABASE_URL).path.lstrip("/")
    
    print(f"✅ Connecting to MongoDB Database: {db_name}")  # Debugging log
    print(f"Service started successfully with MongoDB connection.")
    
    # Initialize Beanie with the correct database name
    await init_beanie(database=client[db_name], document_models=[Team,User,ResetToken])