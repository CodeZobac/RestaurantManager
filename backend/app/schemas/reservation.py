from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReservationCreate(BaseModel):
    client_name: str = Field(..., example="John Doe")
    client_contact: str = Field(..., example="john@example.com")
    reservation_time: datetime = Field(..., example="2025-06-23T19:00:00Z")
    party_size: int = Field(..., example=4)
    customer_id: int = Field(..., example=1)
    # reservation_date will be derived, not required from client

class ReservationResponse(BaseModel):
    reservation_id: int
    status: str
    table_id: int
    message: str

class ReservationErrorResponse(BaseModel):
    error: str

class ApiResponse(BaseModel):
    message: str
