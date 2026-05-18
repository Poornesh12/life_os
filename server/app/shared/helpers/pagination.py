from dataclasses import dataclass


@dataclass
class PaginationParams:
    page: int = 1
    page_size: int = 20

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


def compute_total_pages(total: int, page_size: int) -> int:
    if page_size <= 0:
        return 0
    return max(1, -(-total // page_size))  # ceiling division
