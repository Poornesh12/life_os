from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

from app.modules.finance.enums.transaction_enums import TransactionType, ExpenseCategory


# ─── Requests ────────────────────────────────────────────────────────────────

class CreateTransactionRequest(BaseModel):
    type: TransactionType
    category: ExpenseCategory
    amount: float = Field(..., gt=0, description="Must be greater than 0")
    description: str = Field(..., min_length=1, max_length=500)
    date: datetime


class UpdateTransactionRequest(BaseModel):
    category: Optional[ExpenseCategory] = None
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    date: Optional[datetime] = None


# ─── Responses ───────────────────────────────────────────────────────────────

class TransactionResponse(BaseModel):
    id: str
    user_id: str
    type: TransactionType
    category: ExpenseCategory
    amount: float
    description: str
    date: datetime
    created_at: datetime
    updated_at: datetime


class CategorySummary(BaseModel):
    category: str
    total: float
    count: int


class MonthlySummary(BaseModel):
    year: int
    month: int
    total_income: float
    total_expenses: float
    net: float
    by_category: List[CategorySummary]


class DashboardAnalytics(BaseModel):
    total_income: float
    total_expenses: float
    net_balance: float
    this_month_income: float
    this_month_expenses: float
    top_categories: List[CategorySummary]
    recent_transactions: List[TransactionResponse]
