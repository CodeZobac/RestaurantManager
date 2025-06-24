from fastapi import APIRouter, Request, HTTPException
from app.services.telegram_service import telegram_service
from app.core.config import settings
import httpx
import os
import re
from typing import Optional
from fastapi import APIRouter, Request, HTTPException
from app.services.telegram_service import telegram_service
from app.core.config import settings
from app.supabase_client import supabase_get, supabase_patch # Import supabase_get and supabase_patch

router = APIRouter(prefix="/telegram", tags=["telegram"])

@router.get("/secret")
async def get_secret():
    """
    Temporary endpoint to expose the telegram_webhook_secret for debugging.
    """
    return {"secret": settings.telegram_webhook_secret}

# Helper function to check if a Telegram user is an admin
async def is_telegram_admin(user_id: int, phone_number: Optional[str] = None) -> bool:
    """
    Checks if a given Telegram user ID or phone number corresponds to an admin.
    """
    query_params = f"telegram_chat_id=eq.{user_id}"
    if phone_number:
        query_params += f"&phone_number=eq.{phone_number}"
    
    try:
        # Query the 'admins' table for the user_id or phone_number
        admins = await supabase_get("admins", params=query_params)
        return len(admins) > 0
    except httpx.HTTPStatusError as e:
        logger.error(f"Error checking admin status: {e}", exc_info=True)
        return False
    except Exception as e:
        logger.error(f"Unexpected error checking admin status: {e}", exc_info=True)
        return False

import logging

logger = logging.getLogger(__name__)

@router.post("/webhook")
async def telegram_webhook(request: Request):
    """
    Receives Telegram webhook callback queries and messages.
    Validates a secret token in the X-Telegram-Secret-Token header.
    """
    logger.info("Telegram webhook called")
    secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token")
    logger.info(f"Secret from header: {secret}")
    logger.info(f"Expected secret from settings: {settings.telegram_webhook_secret}")
    if not secret or secret != settings.telegram_webhook_secret:
        logger.warning("Invalid or missing webhook secret token")
        logger.warning(f"Received secret: {secret}, Expected secret: {settings.telegram_webhook_secret}")
        raise HTTPException(status_code=403, detail="Invalid or missing webhook secret token")
    data = await request.json()
    logger.info(f"Data from Telegram: {data}")

    message = data.get("message")
    callback_query = data.get("callback_query")

    user_id = None
    phone_number = None
    if message:
        chat = message.get("chat", {})
        user_id = chat.get("id")
        # Attempt to get phone number from message if available (e.g., from contact sharing)
        contact = message.get("contact")
        if contact and contact.get("user_id") == user_id:
            phone_number = contact.get("phone_number")
    elif callback_query:
        chat = callback_query.get("message", {}).get("chat", {})
        user_id = chat.get("id")

    if not user_id:
        raise HTTPException(status_code=400, detail="Could not determine user ID from payload")

    # Check if the user is an admin
    if not await is_telegram_admin(user_id, phone_number):
        if telegram_service:
            await telegram_service.bot.send_message(
                chat_id=user_id,
                text="Unauthorized: This bot is for authorized administrators only."
            )
        return {"ok": True}

    # Handle regular messages (e.g., /start or email)
    if message:
        text = message.get("text", "")
        username = chat.get("username", "")
        first_name = chat.get("first_name", "")

        if text.strip() == "/start":
            if telegram_service:
                await telegram_service.bot.send_message(
                    chat_id=user_id,
                    text="Welcome, Admin! Please reply with your email address to complete registration."
                )
            # Search for admin record by telegram_chat_id or phone_number
            query_params = f"telegram_chat_id=eq.{user_id}"
            if phone_number:
                query_params += f"&phone_number=eq.{phone_number}"
            
            # Use supabase_get to fetch admin records
            admins = await supabase_get("admins", params=query_params)

            if admins:
                admin_id = admins[0]["id"]
                # Update admin record with telegram_chat_id and username/first_name
                await supabase_patch(
                    "admins",
                    row_id=admin_id,
                    data={
                        "telegram_chat_id": user_id,
                        "telegram_username": username,
                        "first_name": first_name
                    },
                    id_column="id"
                )
                if telegram_service:
                    await telegram_service.bot.send_message(
                        chat_id=user_id,
                        text="Welcome, Admin! Please reply with your email address to complete registration."
                    )
            else:
                if telegram_service:
                    await telegram_service.bot.send_message(
                        chat_id=user_id,
                        text="Unauthorized: You are not registered as an admin."
                    )
                return {"ok": True}
            return {"ok": True}

        # If admin replies with an email address
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if re.match(email_regex, text.strip()):
            # Update admin record with email
            await supabase_patch(
                "admins",
                row_id=user_id, # Assuming user_id is the primary key or unique identifier for admin
                data={"email": text.strip()},
                id_column="telegram_chat_id" # Patch by telegram_chat_id
            )
            if telegram_service:
                await telegram_service.bot.send_message(
                    chat_id=user_id,
                    text="Your email has been registered. You will now receive reservation notifications linked to your email."
                )
            return {"ok": True}

    # Only process callback queries if it's an admin
    if callback_query:
        callback_data = callback_query.get("data")
        message = callback_query.get("message")
        chat = message.get("chat") if message else None
        message_id = message.get("message_id") if message else None

        if not callback_data or not chat or not message_id:
            raise HTTPException(status_code=400, detail="Invalid callback payload")

        # Parse action and reservation_id
        try:
            action, reservation_id = callback_data.split(":")
            assert action in ("confirm", "discard")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid callback data format")

        # Update reservation status in Supabase
        new_status = "confirmed" if action == "confirm" else "discarded"
        async with httpx.AsyncClient() as client:
            resp = await client.patch(
                f"{settings.supabase_url}/rest/v1/reservations?id=eq.{reservation_id}",
                headers={
                    "apikey": settings.supabase_service_key,
                    "Authorization": f"Bearer {settings.supabase_service_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation",
                },
                json={"status": new_status},
            )
            if resp.status_code not in (200, 204):
                raise HTTPException(status_code=500, detail="Failed to update reservation status")

        # Edit original Telegram message to show action was completed
        if telegram_service:
            try:
                from telegram import InlineKeyboardMarkup
                text = f"Reservation {reservation_id} {new_status} by admin."
                telegram_service.bot.edit_message_text(
                    chat_id=chat["id"],
                    message_id=message_id,
                    text=text,
                    reply_markup=InlineKeyboardMarkup([])
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to edit Telegram message: {e}")

        # Respond to Telegram to remove loading spinner
        return {"ok": True}
    
    return {"ok": True} # Return OK for unhandled messages from authorized admins
