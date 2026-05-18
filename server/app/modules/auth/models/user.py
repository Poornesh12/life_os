from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


class UserDocument(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    username: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    @staticmethod
    def from_mongo(doc: dict) -> "UserDocument":
        doc["id"] = str(doc.pop("_id"))
        return UserDocument(**doc)

    def to_mongo(self) -> dict:
        data = self.model_dump(exclude={"id"})
        return data
