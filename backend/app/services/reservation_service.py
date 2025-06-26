import logging
from typing import List, Dict, Any, Optional 
from datetime import datetime
from app.supabase_client import supabase_get, supabase_post
from app.schemas.reservation import Reservation

logger = logging.getLogger(__name__)

from app.schemas.reservation import ReservationCreate

class ReservationService:
    async def get_pending_reservations(self, restaurant_id: Optional[str] = None) -> List[Reservation]:
        """
        Fetches all pending reservations from the database, optionally filtered by restaurant.
        """
        try:
            params = {"status": "eq.pending", "select": "*,reservation_date"}
            if restaurant_id:
                tables_params = {"restaurant_id": f"eq.{restaurant_id}"}
                tables_data = await supabase_get("tables", params=tables_params)
                table_ids = [table["id"] for table in tables_data]

                if not table_ids:
                    return []

                params["table_id"] = f"in.({','.join(map(str, table_ids))})"

            pending_reservations_data = await supabase_get("reservations", params=params)
            
            
            pending_reservations = [Reservation(**data) for data in pending_reservations_data]
            return pending_reservations

        except Exception as e:
            logger.error(f"Error fetching pending reservations: {e}", exc_info=True)
            return []

    async def create_reservation(self, reservation_data: ReservationCreate) -> Optional[Reservation]:
        """
        Creates a new reservation in the database.
        """
        try:
            data_to_insert = reservation_data.model_dump()
            data_to_insert["status"] = "pending"
            
            created_reservation = await supabase_post("reservations", data=data_to_insert)

            if created_reservation:
                return Reservation(**created_reservation[0])
            
            return None

        except Exception as e:
            logger.error(f"Error creating reservation: {e}", exc_info=True)
            return None

# Singleton instance for use in app
reservation_service = ReservationService()
