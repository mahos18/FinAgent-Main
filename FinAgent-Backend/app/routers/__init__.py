from .auth import router as auth_router
from .users import router as users_router
from .transactions import router as transactions_router
from .budgets import router as budgets_router
from .goals import router as goals_router
from .advisor import router as advisor_router

__all__ = [
    "auth_router",
    "users_router",
    "transactions_router",
    "budgets_router",
    "goals_router",
    "advisor_router",
]
