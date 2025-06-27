import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.supabase_client import supabase_get
from app.core.config import settings
from app.services.telegram_token_service import (
    generate_telegram_token as generate_token,
    get_token_info as get_info,
    cleanup_expired_tokens as cleanup,
)

router = APIRouter(prefix="/auth", tags=["authentication"])
logger = logging.getLogger(__name__)


class TelegramTokenRequest(BaseModel):
    admin_id: str


@router.post("/telegram/generate-token")
async def generate_telegram_token(request: TelegramTokenRequest):
    """
    Generate a unique token for Telegram deep linking.
    """
    try:
        # Check if it's a temporary admin ID (for onboarding flow)
        if request.admin_id.startswith("temp_"):
            # For temporary IDs, skip admin validation and generate token directly
            logger.info(f"Generating token for temporary admin ID: {request.admin_id}")
        else:
            # For real admin IDs, validate they exist in the database
            admins = await supabase_get("admins", params=f"id=eq.{request.admin_id}")
            if not admins:
                raise HTTPException(status_code=404, detail="Admin not found")

        # Ensure we have a bot username configured
        if not settings.telegram_bot_username:
            raise HTTPException(status_code=500, detail="Telegram bot username not configured")
            
        token_data = generate_token(request.admin_id, settings.telegram_bot_username)
        return token_data

    except Exception as e:
        logger.error(f"Error generating Telegram token: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate token")


@router.get("/telegram/token/{token}")
async def get_token_info(token: str):
    """
    Get information about a Telegram token.
    """
    token_data = get_info(token)
    if not token_data:
        raise HTTPException(status_code=404, detail="Token not found or expired")

    return {
        "admin_id": token_data["admin_id"],
        "expires_at": token_data["expires_at"].isoformat(),
        "used": token_data["used"],
    }


@router.post("/telegram/cleanup-tokens")
async def cleanup_tokens():
    """
    Manually trigger the cleanup of expired tokens.
    """
    cleanup()
    return {"message": "Expired tokens cleaned up."}
