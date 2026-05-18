from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.dependencies import get_current_user_id, get_db
from app.modules.auth.schemas.auth_schemas import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.modules.auth.services.auth_service import AuthService
from app.shared.dto.response import SuccessResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service(db: AsyncIOMotorDatabase = Depends(get_db)) -> AuthService:
    return AuthService(db)


@router.post("/register", response_model=SuccessResponse[TokenResponse], status_code=201)
async def register(
    payload: RegisterRequest,
    service: AuthService = Depends(get_auth_service),
):
    result = await service.register(payload)
    return SuccessResponse(data=result)


@router.post("/login", response_model=SuccessResponse[TokenResponse])
async def login(
    payload: LoginRequest,
    service: AuthService = Depends(get_auth_service),
):
    result = await service.login(payload)
    return SuccessResponse(data=result)


@router.post("/refresh", response_model=SuccessResponse[TokenResponse])
async def refresh(
    payload: RefreshTokenRequest,
    service: AuthService = Depends(get_auth_service),
):
    result = await service.refresh_token(payload.refresh_token)
    return SuccessResponse(data=result)


@router.get("/me", response_model=SuccessResponse[UserResponse])
async def get_me(
    user_id: str = Depends(get_current_user_id),
    service: AuthService = Depends(get_auth_service),
):
    result = await service.get_me(user_id)
    return SuccessResponse(data=result)
