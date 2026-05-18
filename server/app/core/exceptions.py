from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception."""

    def __init__(self, status_code: int, message: str) -> None:
        super().__init__(status_code=status_code, detail=message)


class AuthException(AppException):
    def __init__(self, message: str = "Authentication failed") -> None:
        super().__init__(status.HTTP_401_UNAUTHORIZED, message)


class ForbiddenException(AppException):
    def __init__(self, message: str = "Access forbidden") -> None:
        super().__init__(status.HTTP_403_FORBIDDEN, message)


class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource") -> None:
        super().__init__(status.HTTP_404_NOT_FOUND, f"{resource} not found")


class ConflictException(AppException):
    def __init__(self, message: str = "Resource already exists") -> None:
        super().__init__(status.HTTP_409_CONFLICT, message)


class ValidationException(AppException):
    def __init__(self, message: str = "Validation error") -> None:
        super().__init__(status.HTTP_400_BAD_REQUEST, message)
