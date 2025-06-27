import logging
from typing import Optional
from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.error import TelegramError
from app.core.config import settings
from app.schemas.restaurant import Restaurant
from app.schemas.admin import Admin  
from app.supabase_client import supabase_get

logger = logging.getLogger(__name__)

class TelegramService:
    def __init__(self, token: Optional[str]):
        if not token:
            raise ValueError("Telegram bot token is not set in environment variables.")
        self.bot = Bot(token=token)

    async def send_start_message(self, chat_id: int, first_name: str):
        """
        Sends a personalized welcome message.
        """
        start_text = (
            f"Hi {first_name}, welcome to the Restaurant Management Bot!\n\n"
            "Use /help to see the full list of commands."
        )
        try:
            await self.bot.send_message(
                chat_id=chat_id,
                text=start_text,
                parse_mode="HTML"
            )
        except TelegramError as e:
            logger.error(f"Failed to send start message: {e}")

    async def send_help_menu(self, chat_id: int):
        """
        Sends a help menu with available commands.
        """
        help_text = (
            "<b>Welcome to the Restaurant Management Bot!</b>\n\n"
            "Here are the available commands:\n"
            "/start - Show this welcome message and command list\n"
            "/pending_reservations - Manually check for any pending reservations that have not yet been notified.\n"
            "/help - Show this help menu\n"
        )
        try:
            await self.bot.send_message(
                chat_id=chat_id,
                text=help_text,
                parse_mode="HTML"
            )
        except TelegramError as e:
            logger.error(f"Failed to send help menu: {e}")

    async def send_reservation_notification(self, chat_id: int, reservation_id: str, reservation_info: str):
        """
        Sends a reservation notification with inline Confirm/Discard buttons.
        """
        keyboard = [
            [
                InlineKeyboardButton("Confirm", callback_data=f"confirm:{reservation_id}"),
                InlineKeyboardButton("Discard", callback_data=f"discard:{reservation_id}")
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        message_text = f"New reservation:\n{reservation_info}"
        try:
            sent_message = await self.bot.send_message(
                chat_id=chat_id,
                text=message_text,
                reply_markup=reply_markup,
                parse_mode="HTML"
            )
            return sent_message
        except TelegramError as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return None


async def get_admin_by_telegram_id(telegram_chat_id: int) -> Optional[Admin]:
    """
    Fetches an admin by their Telegram chat ID.
    """

    admins = await supabase_get("admins", params=f"telegram_chat_id=eq.{telegram_chat_id}")
    if admins:
        return Admin(**admins[0])
    return None

async def set_admin_restaurant(telegram_chat_id: int, restaurant_id: str) -> Optional[Admin]:
    """
    Associates a Telegram admin with a specific restaurant.
    """


    from app.services.restaurant_service import restaurant_service
    restaurant = await restaurant_service.get_restaurant_by_id(restaurant_id)
    if not restaurant:
        logger.warning(f"Restaurant with ID {restaurant_id} not found.")
        return None


    admins = await supabase_get("admins", params=f"telegram_chat_id=eq.{telegram_chat_id}")
    if admins:
        admin_id = admins[0]['id']
        update_data = {"restaurant_id": restaurant_id}
        updated_admin_data = await supabase_get(
            "admins", 
            params=f"id=eq.{admin_id}", 
            method="patch", 
            data=update_data
        )
        if updated_admin_data:
            return Admin(**updated_admin_data[0])
    else:
        logger.warning(f"Admin with Telegram chat ID {telegram_chat_id} not found.")
    return None

async def is_telegram_admin(user_id: int, phone_number: Optional[str] = None) -> bool:
    """
    Checks if a given Telegram user ID or phone number corresponds to an admin in the database.
    """

    query_params = f"telegram_chat_id=eq.{user_id}"
    if phone_number:
        query_params += f"&phone_number=eq.{phone_number}"
    
    admins = await supabase_get("admins", params=query_params)
    return bool(admins)

# Singleton instance for use in app
telegram_service: Optional[TelegramService] = None
if settings.telegram_bot_token:
    try:
        telegram_service = TelegramService(settings.telegram_bot_token)
    except Exception as e:
        logger.error(f"TelegramService initialization failed: {e}")
