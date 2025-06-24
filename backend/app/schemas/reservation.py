from typing import Optional, List
from datetime import date, time, datetime
from pydantic import BaseModel, field

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

