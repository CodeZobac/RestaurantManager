from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AdminBase(BaseModel):
    email: str = Field(..., example="admin@example.com")
    name: Optional[str] = None
    username: Optional[str] = None
    telegram_chat_id: Optional[int] = None
    telegram_username: Optional[str] = None
    phone_number: Optional[str] = None
    first_name: Optional[str] = None
    restaurant_id: Optional[str] = None

class AdminCreate(AdminBase):
    pass

class Admin(AdminBase):
    id: str = Field(..., alias="id")
    role: Optional[str] = "admin"
    emailVerified: Optional[datetime] = None
    image: Optional[str] = None
    password_hash: Optional[str] = None

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
