import logging
from typing import Optional
from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.error import TelegramError
from app.core.config import settings

logger = logging.getLogger(__name__)

class TelegramService:
    def __init__(self, token: Optional[str]):
        if not token:
            raise ValueError("Telegram bot token is not set in environment variables.")
        self.bot = Bot(token=token)

    def send_reservation_notification(self, chat_id: int, reservation_id: str, reservation_info: str):
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
            sent_message = self.bot.send_message(
                chat_id=chat_id,
                text=message_text,
                reply_markup=reply_markup,
                parse_mode="HTML"
            )
            return sent_message
        except TelegramError as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return None

# Singleton instance for use in app
telegram_service: Optional[TelegramService] = None
if settings.telegram_bot_token:
    try:
        telegram_service = TelegramService(settings.telegram_bot_token)
    except Exception as e:
        logger.error(f"TelegramService initialization failed: {e}")
