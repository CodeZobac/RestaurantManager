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
            params = {"status": "eq.pending"}
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
            data = reservation_data.model_dump(by_alias=True, exclude_unset=True)
            if 'reservation_time' in data and isinstance(data['reservation_time'], datetime):
                data['reservation_date'] = data['reservation_time'].date().isoformat()
                data['reservation_time'] = data['reservation_time'].time().isoformat()

            # Fetch available tables for the restaurant
            tables_params = {"restaurant_id": f"eq.{reservation_data.restaurant_id}"}
            available_tables = await supabase_get("tables", params=tables_params)

            if not available_tables:
                logger.error(f"No available tables found for restaurant ID: {reservation_data.restaurant_id}")
                return None
            
            # Assign the first available table
            data['table_id'] = available_tables[0]['id']

            new_reservation_data = await supabase_post("reservations", data=data)
            if new_reservation_data:
                return Reservation(**new_reservation_data[0])
            return None
        except Exception as e:
            logger.error(f"Error creating reservation: {e}", exc_info=True)
            return None

# Singleton instance for use in app
reservation_service = ReservationService()
