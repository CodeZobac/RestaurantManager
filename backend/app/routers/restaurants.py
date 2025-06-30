from fastapi import APIRouter, Depends, HTTPException
from ..services.restaurant_service import RestaurantService
from ..schemas.restaurant import Restaurant

router = APIRouter(
    prefix="/restaurants",
    tags=["restaurants"],
)

@router.get("/{restaurant_id}", response_model=Restaurant)
async def get_restaurant_for_widget(
    restaurant_id: str,
    restaurant_service: RestaurantService = Depends(),
):
    """
    Get public details for a specific restaurant.
    This endpoint is designed to be used by the embeddable widget.
    """
    restaurant = await restaurant_service.get_restaurant_by_id(restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant
