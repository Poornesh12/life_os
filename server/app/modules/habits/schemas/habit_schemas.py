from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ─── Habit Requests ──────────────────────────────────────────────────────────

class CreateHabitRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field("", max_length=500)
    color: str = "#6366f1"
    icon: str = "⚡"
    target_days: List[int] = Field(default=[0, 1, 2, 3, 4, 5, 6])


class UpdateHabitRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    color: Optional[str] = None
    icon: Optional[str] = None
    target_days: Optional[List[int]] = None
    is_active: Optional[bool] = None


# ─── Log Requests ────────────────────────────────────────────────────────────

class LogHabitRequest(BaseModel):
    completed_date: datetime
    notes: Optional[str] = Field(None, max_length=500)


# ─── Responses ───────────────────────────────────────────────────────────────

class HabitResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    color: str
    icon: str
    target_days: List[int]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class HabitLogResponse(BaseModel):
    id: str
    habit_id: str
    user_id: str
    completed_date: datetime
    notes: Optional[str]
    created_at: datetime


class HabitStatsResponse(BaseModel):
    habit_id: str
    name: str
    current_streak: int
    longest_streak: int
    total_completions: int
    completion_rate_7d: float   # 0.0 – 1.0
    completion_rate_30d: float
