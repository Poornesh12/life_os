from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.shared.base.base_repository import BaseRepository
from app.modules.habits.models.habit import HabitDocument, HabitLogDocument


class HabitRepository(BaseRepository):
    collection_name = "habits"

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db)

    async def create(self, habit: HabitDocument) -> HabitDocument:
        data = habit.to_mongo()
        data["user_id"] = ObjectId(habit.user_id)
        result = await self.collection.insert_one(data)
        habit.id = str(result.inserted_id)
        return habit

    async def find_by_id(self, habit_id: str, user_id: str) -> Optional[HabitDocument]:
        try:
            doc = await self.collection.find_one(
                {"_id": ObjectId(habit_id), "user_id": ObjectId(user_id)}
            )
        except Exception:
            return None
        return HabitDocument.from_mongo(doc) if doc else None

    async def find_by_user(self, user_id: str) -> List[HabitDocument]:
        cursor = self.collection.find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
        return [HabitDocument.from_mongo(doc) async for doc in cursor]

    async def update(self, habit_id: str, user_id: str, data: dict) -> bool:
        result = await self.collection.update_one(
            {"_id": ObjectId(habit_id), "user_id": ObjectId(user_id)},
            {"$set": data},
        )
        return result.modified_count > 0

    async def delete(self, habit_id: str, user_id: str) -> bool:
        result = await self.collection.delete_one(
            {"_id": ObjectId(habit_id), "user_id": ObjectId(user_id)}
        )
        return result.deleted_count > 0


class HabitLogRepository(BaseRepository):
    collection_name = "habit_logs"

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db)

    async def create(self, log: HabitLogDocument) -> HabitLogDocument:
        data = log.to_mongo()
        data["habit_id"] = ObjectId(log.habit_id)
        data["user_id"] = ObjectId(log.user_id)
        result = await self.collection.insert_one(data)
        log.id = str(result.inserted_id)
        return log

    async def find_by_habit_and_date(self, habit_id: str, user_id: str, date: datetime) -> Optional[HabitLogDocument]:
        start = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        end = date.replace(hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc)
        doc = await self.collection.find_one({
            "habit_id": ObjectId(habit_id),
            "user_id": ObjectId(user_id),
            "completed_date": {"$gte": start, "$lte": end},
        })
        return HabitLogDocument.from_mongo(doc) if doc else None

    async def find_by_habit(self, habit_id: str, user_id: str, skip: int = 0, limit: int = 30) -> List[HabitLogDocument]:
        cursor = (
            self.collection
            .find({"habit_id": ObjectId(habit_id), "user_id": ObjectId(user_id)})
            .sort("completed_date", -1)
            .skip(skip)
            .limit(limit)
        )
        return [HabitLogDocument.from_mongo(doc) async for doc in cursor]

    async def find_by_user_in_range(self, user_id: str, start: datetime, end: datetime) -> List[HabitLogDocument]:
        cursor = self.collection.find({
            "user_id": ObjectId(user_id),
            "completed_date": {"$gte": start, "$lt": end},
        })
        return [HabitLogDocument.from_mongo(doc) async for doc in cursor]

    async def count_by_habit(self, habit_id: str, user_id: str) -> int:
        return await self.collection.count_documents(
            {"habit_id": ObjectId(habit_id), "user_id": ObjectId(user_id)}
        )
