from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.shared.base.base_repository import BaseRepository
from app.modules.finance.models.transaction import TransactionDocument
from app.modules.finance.enums.transaction_enums import TransactionType


class TransactionRepository(BaseRepository):
    collection_name = "transactions"

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db)

    async def create(self, txn: TransactionDocument) -> TransactionDocument:
        data = txn.to_mongo()
        data["user_id"] = ObjectId(txn.user_id)
        result = await self.collection.insert_one(data)
        txn.id = str(result.inserted_id)
        return txn

    async def find_by_id(self, txn_id: str, user_id: str) -> Optional[TransactionDocument]:
        try:
            doc = await self.collection.find_one(
                {"_id": ObjectId(txn_id), "user_id": ObjectId(user_id)}
            )
        except Exception:
            return None
        return TransactionDocument.from_mongo(doc) if doc else None

    async def find_by_user(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 20,
        type_filter: Optional[TransactionType] = None,
    ) -> List[TransactionDocument]:
        query: dict = {"user_id": ObjectId(user_id)}
        if type_filter:
            query["type"] = type_filter.value
        cursor = self.collection.find(query).sort("date", -1).skip(skip).limit(limit)
        return [TransactionDocument.from_mongo(doc) async for doc in cursor]

    async def count_by_user(self, user_id: str, type_filter: Optional[TransactionType] = None) -> int:
        query: dict = {"user_id": ObjectId(user_id)}
        if type_filter:
            query["type"] = type_filter.value
        return await self.collection.count_documents(query)

    async def update(self, txn_id: str, user_id: str, update_data: dict) -> bool:
        result = await self.collection.update_one(
            {"_id": ObjectId(txn_id), "user_id": ObjectId(user_id)},
            {"$set": update_data},
        )
        return result.modified_count > 0

    async def delete(self, txn_id: str, user_id: str) -> bool:
        result = await self.collection.delete_one(
            {"_id": ObjectId(txn_id), "user_id": ObjectId(user_id)}
        )
        return result.deleted_count > 0

    async def get_monthly_summary(self, user_id: str, year: int, month: int) -> dict:
        start = datetime(year, month, 1, tzinfo=timezone.utc)
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc) if month == 12 else datetime(year, month + 1, 1, tzinfo=timezone.utc)

        pipeline = [
            {"$match": {"user_id": ObjectId(user_id), "date": {"$gte": start, "$lt": end}}},
            {
                "$group": {
                    "_id": {"type": "$type", "category": "$category"},
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1},
                }
            },
        ]
        cursor = self.collection.aggregate(pipeline)
        return [doc async for doc in cursor]

    async def get_dashboard_aggregates(self, user_id: str) -> dict:
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {
                "$group": {
                    "_id": "$type",
                    "total": {"$sum": "$amount"},
                }
            },
        ]
        cursor = self.collection.aggregate(pipeline)
        return {doc["_id"]: doc["total"] async for doc in cursor}

    async def get_category_totals(self, user_id: str, type_filter: str, start: datetime, end: datetime) -> list:
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id), "type": type_filter, "date": {"$gte": start, "$lt": end}}},
            {"$group": {"_id": "$category", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
            {"$sort": {"total": -1}},
            {"$limit": 5},
        ]
        cursor = self.collection.aggregate(pipeline)
        return [doc async for doc in cursor]
