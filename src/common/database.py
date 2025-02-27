from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models.models import Team, User, ResetToken
from config import settings
from urllib.parse import urlparse
import certifi  # For SSL/TLS certificate validation
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    """Initialize MongoDB connection and register models."""
    try:
        # Log the DATABASE_URL (for debugging purposes)
        logger.info(f"Connecting to MongoDB with URL: {settings.DATABASE_URL}")

        # Extract the database name dynamically
        db_name = urlparse(settings.DATABASE_URL).path.lstrip("/")
        if not db_name:
            raise ValueError("Database name not found in DATABASE_URL")

        # Initialize MongoDB client with SSL/TLS
        client = AsyncIOMotorClient(
            settings.DATABASE_URL,
            tls=True,  # Enable TLS/SSL
            tlsCAFile=certifi.where(),  # Use certifi's CA bundle
            tlsAllowInvalidCertificates=False,  # Ensure valid certificates
            connectTimeoutMS=30000,  # 30 seconds
            socketTimeoutMS=30000    # 30 seconds
        )

        # Log successful connection
        logger.info(f"✅ Connected to MongoDB Database: {db_name}")
        
        print(f"✅ Connecting to MongoDB Database: {db_name}")  # Debugging log
        print(f"Service started successfully with MongoDB connection.")

        # Initialize Beanie with the correct database name
        await init_beanie(database=client[db_name], document_models=[Team, User, ResetToken])
        logger.info("Beanie initialized successfully.")

    except Exception as e:
        logger.error(f"❌ Error initializing MongoDB connection: {e}")
        raise