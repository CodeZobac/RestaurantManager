from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, time, datetime

class ReservationBase(BaseModel):
    client_name: str = Field(..., example="John Doe")
    client_contact: str = Field(..., example="john@example.com")
    party_size: int = Field(..., example=4)
    customer_id: int = Field(..., example=1)
    restaurant_id: str = Field(..., example="a1b2c3d4-e5f6-7890-1234-567890abcdef")
    table_id: Optional[int] = None
    special_requests: Optional[str] = None

class ReservationCreate(ReservationBase):
    reservation_date: date = Field(..., example="2025-06-23")
    reservation_time: time = Field(..., example="19:00")

class Reservation(ReservationBase):
    id: int
    reservation_date: date
    reservation_time: time
    status: str
    reminder_sent: Optional[bool] = None
    telegram_message_id: Optional[int] = None
    confirmed_by: Optional[int] = None
    confirmed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ReservationResponse(BaseModel):
    reservation_id: int
    status: str
    table_id: Optional[int] = None
    message: Optional[str] = None

class ReservationErrorResponse(BaseModel):
    reservation_id: Optional[int] = None
    status: Optional[str] = None
    error: str

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

class ApiResponse(BaseModel):
    message: str
