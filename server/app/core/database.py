from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None


async def connect_db() -> None:
    global _client
    _client = AsyncIOMotorClient(settings.MONGODB_URI)
    # Ping to verify connection
    await _client.admin.command("ping")
    logger.info("Connected to MongoDB at %s", settings.MONGODB_URI)


async def disconnect_db() -> None:
    global _client
    if _client:
        _client.close()
        _client = None
        logger.info("Disconnected from MongoDB")


def get_client() -> AsyncIOMotorClient:
    if _client is None:
        raise RuntimeError("Database client is not initialized. Call connect_db() first.")
    return _client


def get_database() -> AsyncIOMotorDatabase:
    return get_client()[settings.DB_NAME]
