from datetime import datetime, timedelta, timezone
from typing import List

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import ConflictException, NotFoundException
from app.modules.habits.models.habit import HabitDocument, HabitLogDocument
from app.modules.habits.repository.habit_repository import HabitLogRepository, HabitRepository
from app.modules.habits.schemas.habit_schemas import (
    CreateHabitRequest,
    HabitLogResponse,
    HabitResponse,
    HabitStatsResponse,
    LogHabitRequest,
    UpdateHabitRequest,
)
from app.shared.helpers.date_utils import utcnow


def _habit_to_response(h: HabitDocument) -> HabitResponse:
    return HabitResponse(
        id=h.id,
        user_id=h.user_id,
        name=h.name,
        description=h.description,
        color=h.color,
        icon=h.icon,
        target_days=h.target_days,
        is_active=h.is_active,
        created_at=h.created_at,
        updated_at=h.updated_at,
    )


def _log_to_response(log: HabitLogDocument) -> HabitLogResponse:
    return HabitLogResponse(
        id=log.id,
        habit_id=log.habit_id,
        user_id=log.user_id,
        completed_date=log.completed_date,
        notes=log.notes,
        created_at=log.created_at,
    )


def _calculate_streak(sorted_dates: List[datetime]) -> tuple[int, int]:
    """Returns (current_streak, longest_streak) given sorted desc dates."""
    if not sorted_dates:
        return 0, 0

    longest = 1
    current = 1
    today = datetime.now(timezone.utc).date()

    # Check if streak is still active (completed today or yesterday)
    last_date = sorted_dates[0].date()
    if (today - last_date).days > 1:
        current = 0
    else:
        current = 1
        for i in range(1, len(sorted_dates)):
            prev = sorted_dates[i - 1].date()
            curr = sorted_dates[i].date()
            if (prev - curr).days == 1:
                current += 1
                longest = max(longest, current)
            else:
                break

    # Calculate overall longest streak
    streak = 1
    for i in range(1, len(sorted_dates)):
        prev = sorted_dates[i - 1].date()
        curr = sorted_dates[i].date()
        if (prev - curr).days == 1:
            streak += 1
            longest = max(longest, streak)
        else:
            streak = 1

    return current, longest


class HabitService:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._repo = HabitRepository(db)
        self._log_repo = HabitLogRepository(db)

    async def create(self, user_id: str, payload: CreateHabitRequest) -> HabitResponse:
        now = utcnow()
        habit = HabitDocument(
            user_id=user_id,
            name=payload.name,
            description=payload.description,
            color=payload.color,
            icon=payload.icon,
            target_days=payload.target_days,
            created_at=now,
            updated_at=now,
        )
        created = await self._repo.create(habit)
        return _habit_to_response(created)

    async def get_all(self, user_id: str) -> List[HabitResponse]:
        habits = await self._repo.find_by_user(user_id)
        return [_habit_to_response(h) for h in habits]

    async def get_by_id(self, habit_id: str, user_id: str) -> HabitResponse:
        habit = await self._repo.find_by_id(habit_id, user_id)
        if not habit:
            raise NotFoundException("Habit")
        return _habit_to_response(habit)

    async def update(self, habit_id: str, user_id: str, payload: UpdateHabitRequest) -> HabitResponse:
        habit = await self._repo.find_by_id(habit_id, user_id)
        if not habit:
            raise NotFoundException("Habit")
        update_data = payload.model_dump(exclude_none=True)
        update_data["updated_at"] = utcnow()
        await self._repo.update(habit_id, user_id, update_data)
        updated = await self._repo.find_by_id(habit_id, user_id)
        return _habit_to_response(updated)

    async def delete(self, habit_id: str, user_id: str) -> None:
        deleted = await self._repo.delete(habit_id, user_id)
        if not deleted:
            raise NotFoundException("Habit")

    async def log_habit(self, habit_id: str, user_id: str, payload: LogHabitRequest) -> HabitLogResponse:
        habit = await self._repo.find_by_id(habit_id, user_id)
        if not habit:
            raise NotFoundException("Habit")

        # Enforce: one log per day per habit
        existing = await self._log_repo.find_by_habit_and_date(habit_id, user_id, payload.completed_date)
        if existing:
            raise ConflictException("Habit already logged for this date")

        now = utcnow()
        log = HabitLogDocument(
            habit_id=habit_id,
            user_id=user_id,
            completed_date=payload.completed_date,
            notes=payload.notes,
            created_at=now,
        )
        created = await self._log_repo.create(log)
        return _log_to_response(created)

    async def get_logs(self, habit_id: str, user_id: str, limit: int = 30) -> List[HabitLogResponse]:
        habit = await self._repo.find_by_id(habit_id, user_id)
        if not habit:
            raise NotFoundException("Habit")
        logs = await self._log_repo.find_by_habit(habit_id, user_id, limit=limit)
        return [_log_to_response(log) for log in logs]

    async def get_stats(self, habit_id: str, user_id: str) -> HabitStatsResponse:
        habit = await self._repo.find_by_id(habit_id, user_id)
        if not habit:
            raise NotFoundException("Habit")

        now = datetime.now(timezone.utc)
        logs_30 = await self._log_repo.find_by_user_in_range(
            user_id,
            start=now - timedelta(days=30),
            end=now,
        )
        habit_logs_30 = [l for l in logs_30 if l.habit_id == habit_id]

        all_logs = await self._log_repo.find_by_habit(habit_id, user_id, limit=365)
        sorted_dates = sorted([l.completed_date for l in all_logs], reverse=True)
        current_streak, longest_streak = _calculate_streak(sorted_dates)

        logs_7 = [l for l in habit_logs_30 if l.completed_date >= now - timedelta(days=7)]
        rate_7d = len(logs_7) / 7.0
        rate_30d = len(habit_logs_30) / 30.0

        total = await self._log_repo.count_by_habit(habit_id, user_id)

        return HabitStatsResponse(
            habit_id=habit_id,
            name=habit.name,
            current_streak=current_streak,
            longest_streak=longest_streak,
            total_completions=total,
            completion_rate_7d=round(min(rate_7d, 1.0), 4),
            completion_rate_30d=round(min(rate_30d, 1.0), 4),
        )
