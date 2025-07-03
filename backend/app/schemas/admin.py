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
    language: Optional[str] = Field(default="en", description="Preferred language (en/pt)")

class AdminCreate(AdminBase):
    pass

class Admin(AdminBase):
    id: str = Field(..., alias="id")
    role: Optional[str] = "admin"
    emailVerified: Optional[datetime] = None
    image: Optional[str] = None
    password_hash: Optional[str] = None

    class Config:
        from_attributes = True
        validate_by_name = True
