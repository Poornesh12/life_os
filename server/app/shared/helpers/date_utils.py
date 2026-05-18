from datetime import datetime, date, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def start_of_month(year: int, month: int) -> datetime:
    return datetime(year, month, 1, tzinfo=timezone.utc)


def end_of_month(year: int, month: int) -> datetime:
    if month == 12:
        return datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    return datetime(year, month + 1, 1, tzinfo=timezone.utc)


def today_utc() -> date:
    return datetime.now(timezone.utc).date()
