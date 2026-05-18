from typing import Optional
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.dependencies import get_current_user_id, get_db
from app.modules.finance.enums.transaction_enums import TransactionType
from app.modules.finance.schemas.transaction_schemas import (
    CreateTransactionRequest,
    DashboardAnalytics,
    MonthlySummary,
    TransactionResponse,
    UpdateTransactionRequest,
)
from app.modules.finance.services.transaction_service import TransactionService
from app.shared.dto.response import PaginatedResponse, SuccessResponse
from app.shared.helpers.pagination import PaginationParams

router = APIRouter(prefix="/transactions", tags=["Finance"])


def get_service(db: AsyncIOMotorDatabase = Depends(get_db)) -> TransactionService:
    return TransactionService(db)


@router.post("", response_model=SuccessResponse[TransactionResponse], status_code=201)
async def create_transaction(
    payload: CreateTransactionRequest,
    user_id: str = Depends(get_current_user_id),
    service: TransactionService = Depends(get_service),
):
    result = await service.create(user_id, payload)
    return SuccessResponse(data=result)


@router.get("", response_model=PaginatedResponse[TransactionResponse])
async def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type: Optional[TransactionType] = None,
    user_id: str = Depends(get_current_user_id),
    service: TransactionService = Depends(get_service),
):
    pagination = PaginationParams(page=page, page_size=page_size)
    return await service.get_all(user_id, pagination, type)


@router.get("/dashboard", response_model=SuccessResponse[DashboardAnalytics])
async def get_dashboard(
    user_id: str = Depends(get_current_user_id),
    service: TransactionService = Depends(get_service),
):
    result = await service.get_dashboard(user_id)
    return SuccessResponse(data=result)


@router.get("/summary/monthly", response_model=SuccessResponse[MonthlySummary])
async def monthly_summary(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    user_id: str = Depends(get_current_user_id),
    service: TransactionService = Depends(get_service),
):
    result = await service.get_monthly_summary(user_id, year, month)
    return SuccessResponse(data=result)


@router.get("/{txn_id}", response_model=SuccessResponse[TransactionResponse])
async def get_transaction(
    txn_id: str,
    user_id: str = Depends(get_current_user_id),
    service: TransactionService = Depends(get_service),
):
    result = await service.get_by_id(txn_id, user_id)
    return SuccessResponse(data=result)


@router.put("/{txn_id}", response_model=SuccessResponse[TransactionResponse])
async def update_transaction(
    txn_id: str,
    payload: UpdateTransactionRequest,
    user_id: str = Depends(get_current_user_id),
    service: TransactionService = Depends(get_service),
):
    result = await service.update(txn_id, user_id, payload)
    return SuccessResponse(data=result)


@router.delete("/{txn_id}", status_code=204)
async def delete_transaction(
    txn_id: str,
    user_id: str = Depends(get_current_user_id),
    service: TransactionService = Depends(get_service),
):
    await service.delete(txn_id, user_id)
