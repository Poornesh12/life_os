from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class HabitDocument(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    description: str
    color: str = "#6366f1"
    icon: str = "⚡"
    target_days: List[int] = [0, 1, 2, 3, 4, 5, 6]  # 0=Mon…6=Sun
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    @staticmethod
    def from_mongo(doc: dict) -> "HabitDocument":
        doc["id"] = str(doc.pop("_id"))
        doc["user_id"] = str(doc["user_id"])
        return HabitDocument(**doc)

    def to_mongo(self) -> dict:
        return self.model_dump(exclude={"id"})


class HabitLogDocument(BaseModel):
    id: Optional[str] = None
    habit_id: str
    user_id: str
    completed_date: datetime  # stored as UTC midnight
    notes: Optional[str] = None
    created_at: datetime

    @staticmethod
    def from_mongo(doc: dict) -> "HabitLogDocument":
        doc["id"] = str(doc.pop("_id"))
        doc["habit_id"] = str(doc["habit_id"])
        doc["user_id"] = str(doc["user_id"])
        return HabitLogDocument(**doc)

    def to_mongo(self) -> dict:
        return self.model_dump(exclude={"id"})
