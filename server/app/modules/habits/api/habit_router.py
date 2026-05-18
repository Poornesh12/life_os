from typing import List
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.dependencies import get_current_user_id, get_db
from app.modules.habits.schemas.habit_schemas import (
    CreateHabitRequest,
    HabitLogResponse,
    HabitResponse,
    HabitStatsResponse,
    LogHabitRequest,
    UpdateHabitRequest,
)
from app.modules.habits.services.habit_service import HabitService
from app.shared.dto.response import SuccessResponse

router = APIRouter(prefix="/habits", tags=["Habits"])


def get_service(db: AsyncIOMotorDatabase = Depends(get_db)) -> HabitService:
    return HabitService(db)


@router.post("", response_model=SuccessResponse[HabitResponse], status_code=201)
async def create_habit(
    payload: CreateHabitRequest,
    user_id: str = Depends(get_current_user_id),
    service: HabitService = Depends(get_service),
):
    result = await service.create(user_id, payload)
    return SuccessResponse(data=result)


@router.get("", response_model=SuccessResponse[List[HabitResponse]])
async def list_habits(
    user_id: str = Depends(get_current_user_id),
    service: HabitService = Depends(get_service),
):
    result = await service.get_all(user_id)
    return SuccessResponse(data=result)


@router.get("/{habit_id}", response_model=SuccessResponse[HabitResponse])
async def get_habit(
    habit_id: str,
    user_id: str = Depends(get_current_user_id),
    service: HabitService = Depends(get_service),
):
    result = await service.get_by_id(habit_id, user_id)
    return SuccessResponse(data=result)


@router.put("/{habit_id}", response_model=SuccessResponse[HabitResponse])
async def update_habit(
    habit_id: str,
    payload: UpdateHabitRequest,
    user_id: str = Depends(get_current_user_id),
    service: HabitService = Depends(get_service),
):
    result = await service.update(habit_id, user_id, payload)
    return SuccessResponse(data=result)


@router.delete("/{habit_id}", status_code=204)
async def delete_habit(
    habit_id: str,
    user_id: str = Depends(get_current_user_id),
    service: HabitService = Depends(get_service),
):
    await service.delete(habit_id, user_id)


@router.post("/{habit_id}/logs", response_model=SuccessResponse[HabitLogResponse], status_code=201)
async def log_habit(
    habit_id: str,
    payload: LogHabitRequest,
    user_id: str = Depends(get_current_user_id),
    service: HabitService = Depends(get_service),
):
    result = await service.log_habit(habit_id, user_id, payload)
    return SuccessResponse(data=result)


@router.get("/{habit_id}/logs", response_model=SuccessResponse[List[HabitLogResponse]])
async def get_logs(
    habit_id: str,
    limit: int = Query(30, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    service: HabitService = Depends(get_service),
):
    result = await service.get_logs(habit_id, user_id, limit)
    return SuccessResponse(data=result)


@router.get("/{habit_id}/stats", response_model=SuccessResponse[HabitStatsResponse])
async def get_stats(
    habit_id: str,
    user_id: str = Depends(get_current_user_id),
    service: HabitService = Depends(get_service),
):
    result = await service.get_stats(habit_id, user_id)
    return SuccessResponse(data=result)
