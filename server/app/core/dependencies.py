from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token
from app.core.exceptions import AuthException
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

bearer_scheme = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    token = credentials.credentials
    payload = decode_token(token)

    user_id: str | None = payload.get("sub")
    token_type: str | None = payload.get("type")

    if not user_id or token_type != "access":
        raise AuthException("Invalid or expired access token")

    return user_id


async def get_db() -> AsyncIOMotorDatabase:
    return get_database()
