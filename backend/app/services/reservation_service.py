import logging
from typing import List, Dict, Any
from app.supabase_client import supabase_get
from app.schemas.reservation import Reservation

logger = logging.getLogger(__name__)

class ReservationService:
    async def get_pending_reservations(self) -> List[Reservation]:
        """
        Fetches all pending reservations from the database.
        """
        try:
            # Query the 'reservations' table for entries with status 'pending'
            pending_reservations_data = await supabase_get("reservations", params="status=eq.pending")
            
            # Convert raw data to Reservation Pydantic models
            pending_reservations = [Reservation(**data) for data in pending_reservations_data]
            return pending_reservations
        except Exception as e:
            logger.error(f"Error fetching pending reservations: {e}", exc_info=True)
            return []

# Singleton instance for use in app
reservation_service = ReservationService()
