from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.modules.finance.enums.transaction_enums import TransactionType, ExpenseCategory


class TransactionDocument(BaseModel):
    id: Optional[str] = None
    user_id: str
    type: TransactionType
    category: ExpenseCategory
    amount: float
    description: str
    date: datetime
    created_at: datetime
    updated_at: datetime

    @staticmethod
    def from_mongo(doc: dict) -> "TransactionDocument":
        doc["id"] = str(doc.pop("_id"))
        doc["user_id"] = str(doc["user_id"])
        return TransactionDocument(**doc)

    def to_mongo(self) -> dict:
        data = self.model_dump(exclude={"id"})
        return data
