from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import AuthException, ConflictException, NotFoundException
from app.modules.auth.models.user import UserDocument
from app.modules.auth.repository.user_repository import UserRepository
from app.modules.auth.schemas.auth_schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)
from app.shared.helpers.date_utils import utcnow


class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._repo = UserRepository(db)

    def _build_token_response(self, user: UserDocument) -> TokenResponse:
        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
            user=UserResponse(
                id=user.id,
                email=user.email,
                username=user.username,
                is_active=user.is_active,
                created_at=user.created_at,
            ),
        )

    async def register(self, payload: RegisterRequest) -> TokenResponse:
        # Check uniqueness
        if await self._repo.find_by_email(payload.email):
            raise ConflictException("An account with this email already exists")
        if await self._repo.find_by_username(payload.username):
            raise ConflictException("This username is already taken")

        now = utcnow()
        user = UserDocument(
            email=payload.email,
            username=payload.username,
            hashed_password=hash_password(payload.password),
            created_at=now,
            updated_at=now,
        )
        created = await self._repo.create(user)
        return self._build_token_response(created)

    async def login(self, payload: LoginRequest) -> TokenResponse:
        user = await self._repo.find_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise AuthException("Invalid email or password")
        if not user.is_active:
            raise AuthException("Account is disabled")
        return self._build_token_response(user)

    async def refresh_token(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        user_id: str | None = payload.get("sub")
        token_type: str | None = payload.get("type")

        if not user_id or token_type != "refresh":
            raise AuthException("Invalid or expired refresh token")

        user = await self._repo.find_by_id(user_id)
        if not user or not user.is_active:
            raise AuthException("User not found or disabled")

        return self._build_token_response(user)

    async def get_me(self, user_id: str) -> UserResponse:
        user = await self._repo.find_by_id(user_id)
        if not user:
            raise NotFoundException("User")
        return UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            is_active=user.is_active,
            created_at=user.created_at,
        )
