from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.supabase_client import supabase_patch, supabase_get
from app.services.telegram_service import get_admin_by_telegram_id
import logging

router = APIRouter(prefix="/telegram", tags=["telegram-settings"])
logger = logging.getLogger(__name__)

class LanguagePreference(BaseModel):
    language: str  # "en" or "pt"

@router.post("/set-language/{telegram_chat_id}")
async def set_language_preference(telegram_chat_id: int, preference: LanguagePreference):
    """
    Set language preference for a Telegram admin.
    """
    # Validate language
    if preference.language not in ["en", "pt"]:
        raise HTTPException(status_code=400, detail="Language must be 'en' or 'pt'")
    
    # Check if admin exists
    admin = await get_admin_by_telegram_id(telegram_chat_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    try:
        # Update admin language preference
        await supabase_patch(
            "admins",
            row_id=admin.id,
            data={"language": preference.language},
            id_column="id"
        )
        
        logger.info(f"Updated language preference for admin {admin.id} to {preference.language}")
        return {"message": f"Language preference updated to {preference.language}"}
        
    except Exception as e:
        logger.error(f"Error updating language preference: {e}")
        raise HTTPException(status_code=500, detail="Failed to update language preference")

@router.get("/language/{telegram_chat_id}")
async def get_language_preference(telegram_chat_id: int):
    """
    Get current language preference for a Telegram admin.
    """
    admin = await get_admin_by_telegram_id(telegram_chat_id)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    language = getattr(admin, 'language', 'en') or 'en'
    return {"language": language}
