from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class RestaurantBase(BaseModel):
    name: str = Field(..., example="My Awesome Restaurant")

class RestaurantCreate(RestaurantBase):
    pass

class Restaurant(RestaurantBase):
    id: str = Field(..., alias="id")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
