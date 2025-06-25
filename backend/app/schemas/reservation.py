from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime, time

class ReservationCreate(BaseModel):
    client_name: str = Field(..., example="John Doe")
    client_contact: str = Field(..., example="john@example.com")
    reservation_time: time = Field(..., example="19:00")
    party_size: int = Field(..., example=4)
    customer_id: int = Field(..., example=1)
    restaurant_id: str = Field(..., example="a1b2c3d4-e5f6-7890-1234-567890abcdef")
    reservation_date: Optional[datetime] = Field(None, example="2025-06-23")


class Reservation(BaseModel):
    reservation_id: int = Field(..., alias="id")
    client_name: str
    client_contact: str
    reservation_time: datetime
    party_size: int
    customer_id: int
    restaurant_id: str 
    status: str
    table_id: Optional[int] = None

    @validator('reservation_time', pre=True)
    def parse_reservation_time(cls, value):
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value)
            except ValueError:
                return datetime.fromisoformat(f"2000-01-01T{value}")
        return value

    class Config:
        orm_mode = True 
        allow_population_by_field_name = True 

class ReservationResponse(BaseModel):
    reservation_id: int
    status: str
    table_id: Optional[int] = None
    message: Optional[str] = None 

class ReservationErrorResponse(BaseModel):
    reservation_id: Optional[int] = None
    status: Optional[str] = None
    error: str

class ApiResponse(BaseModel):
    message: str
