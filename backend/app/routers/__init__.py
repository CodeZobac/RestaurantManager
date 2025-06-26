"""API routers for the Restaurant Manager API"""

from .tables import router as tables_router
from .reservations import router as reservations_router
from .telegram import router as telegram_router

__all__ = ["tables_router", "reservations_router", "telegram_router"]
