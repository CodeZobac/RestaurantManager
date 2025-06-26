"""Configuration settings for the Restaurant Manager API"""

from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    # API Configuration
    app_name: str = "Restaurant Manager API"
    app_version: str = "0.1.0"
    debug: bool = False
    
    # Database Configuration
    database_url: Optional[str] = Field(
        default=None,
        description="Full database URL for Supabase PostgreSQL"
    )
    supabase_url: Optional[str] = Field(
        default=None,
        description="Supabase project URL"
    )
    supabase_anon_key: Optional[str] = Field(
        default=None,
        description="Supabase anonymous API key"
    )
    supabase_service_key: Optional[str] = Field(
        default=None,
        description="Supabase service role key"
    )
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = False
    
    # CORS Configuration
    allowed_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    allowed_methods: list[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allowed_headers: list[str] = ["*"]
    
    # Security
    secret_key: str = Field(
        default="your-secret-key-change-in-production",
        description="Secret key for JWT tokens"
    )

    # Telegram Bot
    telegram_bot_token: Optional[str] = Field(
        default=None,
        description="Telegram Bot API token"
    )
    telegram_webhook_secret: Optional[str] = Field(
        default=None,
        description="Secret token for validating Telegram webhook requests"
    )
    
# Global settings instance
settings = Settings()
