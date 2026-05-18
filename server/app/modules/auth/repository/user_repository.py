from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.shared.base.base_repository import BaseRepository
from app.modules.auth.models.user import UserDocument


class UserRepository(BaseRepository):
    collection_name = "users"

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        super().__init__(db)

    async def find_by_email(self, email: str) -> Optional[UserDocument]:
        doc = await self.collection.find_one({"email": email})
        if doc:
            return UserDocument.from_mongo(doc)
        return None

    async def find_by_id(self, user_id: str) -> Optional[UserDocument]:
        try:
            oid = ObjectId(user_id)
        except Exception:
            return None
        doc = await self.collection.find_one({"_id": oid})
        if doc:
            return UserDocument.from_mongo(doc)
        return None

    async def find_by_username(self, username: str) -> Optional[UserDocument]:
        doc = await self.collection.find_one({"username": username})
        if doc:
            return UserDocument.from_mongo(doc)
        return None

    async def create(self, user: UserDocument) -> UserDocument:
        data = user.to_mongo()
        result = await self.collection.insert_one(data)
        user.id = str(result.inserted_id)
        return user

    async def update(self, user_id: str, update_data: dict) -> bool:
        result = await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
        )
        return result.modified_count > 0
