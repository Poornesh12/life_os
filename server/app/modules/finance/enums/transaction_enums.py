from enum import Enum


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class ExpenseCategory(str, Enum):
    FOOD = "food"
    TRANSPORT = "transport"
    HOUSING = "housing"
    HEALTHCARE = "healthcare"
    ENTERTAINMENT = "entertainment"
    SHOPPING = "shopping"
    EDUCATION = "education"
    UTILITIES = "utilities"
    SAVINGS = "savings"
    INVESTMENT = "investment"
    SALARY = "salary"
    FREELANCE = "freelance"
    OTHER = "other"
