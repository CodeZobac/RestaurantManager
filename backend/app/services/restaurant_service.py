import logging
from typing import List, Optional
from app.supabase_client import supabase_get
from app.schemas.restaurant import Restaurant, RestaurantCreate

logger = logging.getLogger(__name__)

class RestaurantService:
    async def get_all_restaurants(self) -> List[Restaurant]:
        """
        Fetches all restaurants from the database.
        """
        try:
            restaurants_data = await supabase_get("restaurants")
            return [Restaurant(**data) for data in restaurants_data]
        except Exception as e:
            logger.error(f"Error fetching restaurants: {e}", exc_info=True)
            return []

    async def get_restaurant_by_id(self, restaurant_id: str) -> Optional[Restaurant]:
        """
        Fetches a single restaurant by its ID.
        """
        try:
            restaurant_data = await supabase_get("restaurants", params=f"id=eq.{restaurant_id}")
            if restaurant_data:
                return Restaurant(**restaurant_data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching restaurant by ID {restaurant_id}: {e}", exc_info=True)
            return None

    async def create_restaurant(self, restaurant_data: RestaurantCreate) -> Optional[Restaurant]:
        """
        Creates a new restaurant in the database.
        """
        try:
            data = restaurant_data.model_dump(by_alias=True, exclude_unset=True)
            new_restaurant_data = await supabase_get("restaurants", method="post", data=data)
            if new_restaurant_data:
                return Restaurant(**new_restaurant_data[0])
            return None
        except Exception as e:
            logger.error(f"Error creating restaurant: {e}", exc_info=True)
            return None

# Singleton instance for use in app
restaurant_service = RestaurantService()
