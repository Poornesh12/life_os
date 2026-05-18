from datetime import datetime, timezone
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import NotFoundException, ValidationException
from app.modules.finance.enums.transaction_enums import TransactionType
from app.modules.finance.models.transaction import TransactionDocument
from app.modules.finance.repository.transaction_repository import TransactionRepository
from app.modules.finance.schemas.transaction_schemas import (
    CategorySummary,
    CreateTransactionRequest,
    DashboardAnalytics,
    MonthlySummary,
    TransactionResponse,
    UpdateTransactionRequest,
)
from app.shared.dto.response import PaginatedResponse
from app.shared.helpers.date_utils import utcnow
from app.shared.helpers.pagination import PaginationParams, compute_total_pages


def _to_response(txn: TransactionDocument) -> TransactionResponse:
    return TransactionResponse(
        id=txn.id,
        user_id=txn.user_id,
        type=txn.type,
        category=txn.category,
        amount=txn.amount,
        description=txn.description,
        date=txn.date,
        created_at=txn.created_at,
        updated_at=txn.updated_at,
    )


class TransactionService:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._repo = TransactionRepository(db)

    async def create(self, user_id: str, payload: CreateTransactionRequest) -> TransactionResponse:
        now = utcnow()
        txn = TransactionDocument(
            user_id=user_id,
            type=payload.type,
            category=payload.category,
            amount=payload.amount,
            description=payload.description,
            date=payload.date,
            created_at=now,
            updated_at=now,
        )
        created = await self._repo.create(txn)
        return _to_response(created)

    async def get_all(
        self,
        user_id: str,
        pagination: PaginationParams,
        type_filter: Optional[TransactionType] = None,
    ) -> PaginatedResponse[TransactionResponse]:
        items = await self._repo.find_by_user(user_id, pagination.skip, pagination.limit, type_filter)
        total = await self._repo.count_by_user(user_id, type_filter)
        return PaginatedResponse(
            data=[_to_response(t) for t in items],
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
            total_pages=compute_total_pages(total, pagination.page_size),
        )

    async def get_by_id(self, txn_id: str, user_id: str) -> TransactionResponse:
        txn = await self._repo.find_by_id(txn_id, user_id)
        if not txn:
            raise NotFoundException("Transaction")
        return _to_response(txn)

    async def update(self, txn_id: str, user_id: str, payload: UpdateTransactionRequest) -> TransactionResponse:
        txn = await self._repo.find_by_id(txn_id, user_id)
        if not txn:
            raise NotFoundException("Transaction")

        update_data = payload.model_dump(exclude_none=True)
        update_data["updated_at"] = utcnow()

        await self._repo.update(txn_id, user_id, update_data)
        updated = await self._repo.find_by_id(txn_id, user_id)
        return _to_response(updated)

    async def delete(self, txn_id: str, user_id: str) -> None:
        deleted = await self._repo.delete(txn_id, user_id)
        if not deleted:
            raise NotFoundException("Transaction")

    async def get_monthly_summary(self, user_id: str, year: int, month: int) -> MonthlySummary:
        if not (1 <= month <= 12):
            raise ValidationException("Month must be between 1 and 12")

        raw = await self._repo.get_monthly_summary(user_id, year, month)

        total_income = 0.0
        total_expenses = 0.0
        category_map: dict = {}

        for row in raw:
            t = row["_id"]["type"]
            cat = row["_id"]["category"]
            amount = row["total"]
            count = row["count"]

            if t == TransactionType.INCOME:
                total_income += amount
            else:
                total_expenses += amount

            key = cat
            if key not in category_map:
                category_map[key] = {"total": 0.0, "count": 0}
            category_map[key]["total"] += amount
            category_map[key]["count"] += count

        by_category = [
            CategorySummary(category=k, total=v["total"], count=v["count"])
            for k, v in sorted(category_map.items(), key=lambda x: -x[1]["total"])
        ]

        return MonthlySummary(
            year=year,
            month=month,
            total_income=total_income,
            total_expenses=total_expenses,
            net=total_income - total_expenses,
            by_category=by_category,
        )

    async def get_dashboard(self, user_id: str) -> DashboardAnalytics:
        now = datetime.now(timezone.utc)
        aggregates = await self._repo.get_dashboard_aggregates(user_id)
        total_income = aggregates.get(TransactionType.INCOME, 0.0)
        total_expenses = aggregates.get(TransactionType.EXPENSE, 0.0)

        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_of_month = now.replace(day=1, month=now.month + 1) if now.month < 12 else now.replace(year=now.year + 1, month=1, day=1)

        month_inc_rows = await self._repo.get_category_totals(user_id, TransactionType.INCOME, start_of_month, end_of_month)
        month_exp_rows = await self._repo.get_category_totals(user_id, TransactionType.EXPENSE, start_of_month, end_of_month)

        this_month_income = sum(r["total"] for r in month_inc_rows)
        this_month_expenses = sum(r["total"] for r in month_exp_rows)

        top_categories = [
            CategorySummary(category=r["_id"], total=r["total"], count=r["count"])
            for r in month_exp_rows
        ]

        recent = await self._repo.find_by_user(user_id, skip=0, limit=5)

        return DashboardAnalytics(
            total_income=total_income,
            total_expenses=total_expenses,
            net_balance=total_income - total_expenses,
            this_month_income=this_month_income,
            this_month_expenses=this_month_expenses,
            top_categories=top_categories,
            recent_transactions=[_to_response(t) for t in recent],
        )
