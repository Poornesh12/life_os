from abc import ABC
from typing import Any

from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase


class BaseRepository(ABC):
    collection_name: str = ""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._db = db

    @property
    def collection(self) -> AsyncIOMotorCollection:
        return self._db[self.collection_name]

    async def count(self, filter_dict: dict[str, Any] | None = None) -> int:
        return await self.collection.count_documents(filter_dict or {})
