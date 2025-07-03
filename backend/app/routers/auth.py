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
    Only allows token generation for completed admin accounts.
    """
    try:
        # Validate that the admin exists and has completed onboarding
        admins = await supabase_get("admins", params=f"id=eq.{request.admin_id}")
        if not admins:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        admin = admins[0]
        
        # Check if admin has completed onboarding and has a restaurant
        if not admin.get("onboarding_completed"):
            raise HTTPException(status_code=400, detail="Admin must complete onboarding before generating Telegram token")
        
        if not admin.get("restaurant_id"):
            raise HTTPException(status_code=400, detail="Admin must be associated with a restaurant")
        
        # Check if admin already has a Telegram chat ID linked
        if admin.get("telegram_chat_id"):
            raise HTTPException(status_code=400, detail="Admin already has Telegram account linked")

        # Ensure we have a bot username configured
        if not settings.telegram_bot_username:
            raise HTTPException(status_code=500, detail="Telegram bot username not configured")
            
        token_data = generate_token(request.admin_id, settings.telegram_bot_username)
        return token_data

    except HTTPException as http_exc:
        logger.error(f"HTTP exception in generate_telegram_token: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        logger.error(f"Unexpected error in generate_telegram_token: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred while generating the token.")


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
