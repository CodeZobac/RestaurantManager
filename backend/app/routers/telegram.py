import logging
from fastapi import APIRouter, Request, HTTPException
from app.services.telegram_service import telegram_service, is_telegram_admin
from app.services.reservation_service import reservation_service 
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

 
    if not await is_telegram_admin(user_id, phone_number):
        if telegram_service:
            await telegram_service.bot.send_message(
                chat_id=user_id,
                text="Unauthorized: This bot is for authorized administrators only."
            )
        return {"ok": True}


    if message:
        text = message.get("text", "")
        username = chat.get("username", "")
        first_name = chat.get("first_name", "")

        if text.strip() == "/start":
            query_params = f"telegram_chat_id=eq.{user_id}"
            if phone_number:
                query_params += f"&phone_number=eq.{phone_number}"
            
            admins = await supabase_get("admins", params=query_params)

            if admins:
                admin_id = admins[0]["id"]
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
                        text="Welcome, Admin! Use /pending_reservations to view reservations for your associated restaurant."
                    )
            else:
                if telegram_service:
                    await telegram_service.bot.send_message(
                        chat_id=user_id,
                        text="Unauthorized: You are not registered as an admin."
                    )
                return {"ok": True}
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

                pending_reservations = await reservation_service.get_pending_reservations(current_admin.restaurant_id)
                if pending_reservations:
                    for reservation in pending_reservations:
                        reservation_info = (
                            f"<b>Reservation ID:</b> {reservation.reservation_id}\n"
                            f"<b>Client Name:</b> {reservation.client_name}\n"
                            f"<b>Contact:</b> {reservation.client_contact}\n"
                            f"<b>Time:</b> {reservation.reservation_time.strftime('%Y-%m-%d %H:%M')}\n"
                            f"<b>Party Size:</b> {reservation.party_size}\n"
                            f"<b>Status:</b> {reservation.status}\n"
                            f"<b>Restaurant ID:</b> {reservation.restaurant_id}"
                        )
                        keyboard = [
                            [
                                InlineKeyboardButton("Confirm", callback_data=f"confirm:{reservation.reservation_id}"),
                                InlineKeyboardButton("Discard", callback_data=f"discard:{reservation.reservation_id}")
                            ]
                        ]
                        reply_markup = InlineKeyboardMarkup(keyboard)
                        await telegram_service.bot.send_message(
                            chat_id=user_id,
                            text=f"New pending reservation:\n{reservation_info}",
                            reply_markup=reply_markup,
                            parse_mode="HTML"
                        )
                else:
                    await telegram_service.bot.send_message(
                        chat_id=user_id,
                        text=f"No pending reservations for restaurant {current_admin.restaurant_id} at the moment."
                    )
            return {"ok": True}

        # If admin replies with an email address (this part might be less relevant now with restaurant association)
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
