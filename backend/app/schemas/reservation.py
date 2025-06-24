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

class Reservation(BaseModel):
    id: int = Field(..., alias="reservation_id") # Use 'id' from DB, map to 'reservation_id' for consistency
    client_name: str
    client_contact: str
    reservation_time: datetime
    party_size: int
    customer_id: int
    status: str
    table_id: Optional[int] = None # Table ID might be null if not yet assigned

    class Config:
        orm_mode = True # Enable ORM mode for Pydantic to read from SQLAlchemy models or similar
        allow_population_by_field_name = True # Allow initialization by field name as well as alias

class ReservationResponse(BaseModel):
    reservation_id: int
    status: str
    table_id: Optional[int] = None
    message: Optional[str] = None # Make message optional as it might not always be present

class ReservationErrorResponse(BaseModel):
    error: str

class ApiResponse(BaseModel):
    message: str
