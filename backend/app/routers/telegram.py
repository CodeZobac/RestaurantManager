import logging
from fastapi import APIRouter, Request, HTTPException
from datetime import datetime
from app.services.telegram_service import telegram_service, is_telegram_admin
from app.services.reservation_service import reservation_service
from app.services.restaurant_service import restaurant_service
from app.core.config import settings
import httpx
import os
import re
from typing import Optional
from fastapi import APIRouter, Request, HTTPException
from app.supabase_client import supabase_get, supabase_patch
from telegram import InlineKeyboardButton, InlineKeyboardMarkup 
from telegram.error import TelegramError 
from app.services.telegram_service import get_admin_by_telegram_id
from app.services.telegram_token_service import consume_telegram_token

router = APIRouter(prefix="/telegram", tags=["telegram"])


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
      
        contact = message.get("contact")
        if contact and contact.get("user_id") == user_id:
            phone_number = contact.get("phone_number")
    elif callback_query:
        chat = callback_query.get("message", {}).get("chat", {})
        user_id = chat.get("id")

    if not user_id:
        raise HTTPException(status_code=400, detail="Could not determine user ID from payload")
    # Check if user is already an authorized admin before processing any commands
    # For /start command with token, we allow it to proceed for linking
    is_start_with_token = (
        message and 
        message.get("text", "").startswith("/start") and 
        " " in message.get("text", "")
    )
    
    if not is_start_with_token and not await is_telegram_admin(user_id):
        if telegram_service:
            await telegram_service.bot.send_message(
                chat_id=user_id,
                text=(
                    "⚠️ This bot is for authorized restaurant administrators only.\n\n"
                    "If you're an admin, please:\n"
                    "1. Log into your admin dashboard\n" 
                    "2. Go to Settings → Telegram Integration\n"
                    "3. Generate and scan a QR code to link your account"
                )
            )
        return {"ok": True}

    if message:
        text = message.get("text", "")
        username = chat.get("username", "")
        first_name = chat.get("first_name", "")

        if text.startswith("/start"):
            # Extract token if available
            token = None
            if " " in text:
                token = text.split(" ")[1]

            if token:
                # Attempt to consume the token
                admin_id = consume_telegram_token(token)
                if admin_id:
                    # Update admin with Telegram chat_id
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
                    
                    # Send confirmation to user
                    if telegram_service:
                        await telegram_service.bot.send_message(
                            chat_id=user_id,
                            text="🎉 Your Telegram account has been linked successfully! You'll now receive reservation notifications here."
                        )
                    return {"ok": True}

                else:
                    if telegram_service:
                        await telegram_service.bot.send_message(
                            chat_id=user_id,
                            text="❌ This link has expired or is already used. Please generate a new QR code from your admin dashboard."
                        )
                    return {"ok": True}

            # If no token provided, inform user about the proper linking process
            if telegram_service:
                await telegram_service.bot.send_message(
                    chat_id=user_id,
                    text=(
                        "👋 Welcome to the Restaurant Manager Bot!\n\n"
                        "To link your admin account:\n"
                        "1. Go to your admin dashboard\n"
                        "2. Navigate to Settings\n"
                        "3. Generate a QR code in the Telegram section\n"
                        "4. Scan the QR code or click the link\n\n"
                        "If you're already an admin and having issues, please contact support."
                    )
                )
            return {"ok": True}

        elif text.strip() == "/help":
            if telegram_service:
                await telegram_service.send_help_menu(user_id)
            return {"ok": True}
        
        elif text.strip() == "/pending_reservations":
            if telegram_service and reservation_service:
                current_admin = await get_admin_by_telegram_id(user_id)
                
                if not current_admin or not current_admin.restaurant_id:
                    await telegram_service.bot.send_message(
                        chat_id=user_id,
                        text="Your admin account is not associated with a restaurant. Please contact support."
                    )
                    return {"ok": True}

                restaurant = await restaurant_service.get_restaurant_by_id(current_admin.restaurant_id)
                if not restaurant:
                    await telegram_service.bot.send_message(
                        chat_id=user_id,
                        text="Could not find the restaurant associated with your account. Please contact support."
                    )
                    return {"ok": True}
                
                restaurant_name = restaurant.name

                pending_reservations = await reservation_service.get_pending_reservations(current_admin.restaurant_id)
                if pending_reservations:
                    response_text = f"<b>Pending Reservations for {restaurant_name}:</b>\n\n"
                    for reservation in pending_reservations:
                        reservation_datetime = datetime.combine(reservation.reservation_date, reservation.reservation_time)
                        response_text += (
                            f"<b>Reservation ID:</b> {reservation.id}\n"
                            f"<b>Client Name:</b> {reservation.client_name}\n"
                            f"<b>Contact:</b> {reservation.client_contact}\n"
                            f"<b>Time:</b> {reservation_datetime.strftime('%Y-%m-%d %H:%M')}\n"
                            f"<b>Party Size:</b> {reservation.party_size}\n"
                            f"<b>Status:</b> {reservation.status}\n\n"
                        )
                    await telegram_service.bot.send_message(
                        chat_id=user_id,
                        text=response_text,
                        parse_mode="HTML"
                    )
                else:
                    await telegram_service.bot.send_message(
                        chat_id=user_id,
                        text=f"There are no new pending reservations for {restaurant_name} that have not yet been notified."
                    )
            return {"ok": True}


        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if re.match(email_regex, text.strip()):
            await supabase_patch(
                "admins",
                row_id=user_id,
                data={"email": text.strip()},
                id_column="telegram_chat_id"
            )
            if telegram_service:
                await telegram_service.bot.send_message(
                    chat_id=user_id,
                    text="Your email has been registered."
                )
            return {"ok": True}

    if callback_query:
        callback_data = callback_query.get("data")
        message = callback_query.get("message")
        chat = message.get("chat") if message else None
        message_id = message.get("message_id") if message else None

        if not callback_data or not chat or not message_id:
            raise HTTPException(status_code=400, detail="Invalid callback payload")


        try:
            action, reservation_id = callback_data.split(":")
            assert action in ("confirm", "discard")
            logger.info(f"Parsed callback data: action={action}, reservation_id={reservation_id}")
        except Exception as e:
            logger.error(f"Invalid callback data format: {callback_data}, Error: {e}")
            raise HTTPException(status_code=400, detail="Invalid callback data format")


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
            logger.info(f"Supabase patch response status: {resp.status_code}, text: {resp.text}")
            if resp.status_code not in (200, 204):
                logger.error(f"Failed to update reservation status for ID {reservation_id}. Status: {resp.status_code}, Response: {resp.text}")
                raise HTTPException(status_code=500, detail="Failed to update reservation status")

        if telegram_service:
            try:
                text = f"Reservation {reservation_id} {new_status} by admin."
                await telegram_service.bot.edit_message_text(
                    chat_id=chat["id"],
                    message_id=message_id,
                    text=text,
                    reply_markup=InlineKeyboardMarkup([])
                )
                logger.info(f"Edited Telegram message for reservation {reservation_id}")
            except TelegramError as e:
                if "Message is not modified" in str(e):
                    logger.warning(f"Telegram message for reservation {reservation_id} was already modified. Error: {e}")
                else:
                    logger.error(f"Failed to edit Telegram message for chat_id {chat['id']}, message_id {message_id}: {e}")
                    raise HTTPException(status_code=500, detail=f"Failed to edit Telegram message: {e}")
            except Exception as e:
                logger.error(f"An unexpected error occurred while editing Telegram message for chat_id {chat['id']}, message_id {message_id}: {e}")
                raise HTTPException(status_code=500, detail=f"Failed to edit Telegram message: {e}")


        return {"ok": True}
    
    return {"ok": True}
