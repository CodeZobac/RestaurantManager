from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime, time
from typing import Optional, List
from datetime import date, time, datetime
from pydantic import BaseModel, Field

class Reservation(BaseModel):
    id: int
    customer_id: int
    table_id: int
    reservation_date: date
    reservation_time: time
    party_size: int
    status: str
    special_requests: Optional[str] = None
    reminder_sent: Optional[bool] = None
    telegram_message_id: Optional[int] = None
    confirmed_by: Optional[int] = None
    confirmed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    client_contact: Optional[str] = None

class ReservationSummary(BaseModel):
    id: int
    customer_name: str
    reservation_time: time
    party_size: int

class DashboardTable(BaseModel):
    id: int
    name: str
    capacity: int
    location: Optional[str] = None
    status: str
    reservation: Optional[ReservationSummary] = None

class DashboardStatusResponse(BaseModel):
    date: str
    tables: List[DashboardTable]
    reservations: List[Reservation]


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
        from_attributes = True
        validate_by_name = True

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
