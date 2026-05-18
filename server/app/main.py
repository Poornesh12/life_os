from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import connect_db, disconnect_db
from app.core.exceptions import AppException
from app.core.logging import setup_logging
from app.core.middleware import RequestLoggingMiddleware, register_cors

from app.modules.auth.api.auth_router import router as auth_router
from app.modules.finance.api.transaction_router import router as transaction_router
from app.modules.habits.api.habit_router import router as habit_router


setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # Middleware
    register_cors(app)
    app.add_middleware(RequestLoggingMiddleware)

    # Exception handlers
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "message": exc.detail},
        )

    # Routers
    API_PREFIX = "/api/v1"
    app.include_router(auth_router, prefix=API_PREFIX)
    app.include_router(transaction_router, prefix=API_PREFIX)
    app.include_router(habit_router, prefix=API_PREFIX)

    @app.get("/health")
    async def health_check():
        return {"status": "ok", "app": settings.APP_NAME}

    return app


app = create_app()
