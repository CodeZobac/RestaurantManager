from typing import Optional, List
from datetime import date, time, datetime
from pydantic import BaseModel

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