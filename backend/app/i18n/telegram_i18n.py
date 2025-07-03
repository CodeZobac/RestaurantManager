import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class TelegramTranslationService:
    """
    Service for handling Telegram bot message translations.
    Supports English (en) and Portuguese (pt) languages.
    """
    
    def __init__(self):
        self.translations: Dict[str, Dict[str, Any]] = {}
        self.default_locale = "en"
        self.supported_locales = ["en", "pt"]
        self._load_translations()
    
    def _load_translations(self):
        """Load translation files from the messages directory."""
        messages_dir = Path(__file__).parent / "messages"
        
        for locale in self.supported_locales:
            file_path = messages_dir / f"{locale}.json"
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    self.translations[locale] = json.load(f)
                logger.info(f"Loaded {locale} translations from {file_path}")
            except FileNotFoundError:
                logger.error(f"Translation file not found: {file_path}")
                if locale == self.default_locale:
                    # Fallback to empty dict for default locale
                    self.translations[locale] = {}
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON in translation file {file_path}: {e}")
                self.translations[locale] = {}
    
    def get_text(self, key: str, locale: str = None, **kwargs) -> str:
        """
        Get translated text for a given key and locale.
        
        Args:
            key: Translation key (supports dot notation like 'help_menu.title')
            locale: Language code ('en' or 'pt'). Defaults to 'en' if not provided.
            **kwargs: Variables to substitute in the translated text
            
        Returns:
            Translated and formatted text
        """
        if locale is None:
            locale = self.default_locale
        
        # Fallback to default locale if requested locale is not supported
        if locale not in self.supported_locales:
            logger.warning(f"Unsupported locale '{locale}', falling back to '{self.default_locale}'")
            locale = self.default_locale
        
        # Get the translation data for the locale
        translation_data = self.translations.get(locale, {})
        
        # Navigate through nested keys
        keys = key.split('.')
        text = translation_data
        
        for k in keys:
            if isinstance(text, dict) and k in text:
                text = text[k]
            else:
                # Fallback to default locale if key not found
                if locale != self.default_locale:
                    logger.warning(f"Translation key '{key}' not found for locale '{locale}', trying '{self.default_locale}'")
                    return self.get_text(key, self.default_locale, **kwargs)
                else:
                    logger.error(f"Translation key '{key}' not found for default locale '{self.default_locale}'")
                    return f"[Missing translation: {key}]"
        
        if not isinstance(text, str):
            logger.error(f"Translation key '{key}' does not resolve to a string")
            return f"[Invalid translation: {key}]"
        
        # Substitute variables if provided
        if kwargs:
            try:
                # Use format() for string substitution with {variable} syntax
                text = text.format(**kwargs)
            except (KeyError, ValueError) as e:
                logger.error(f"Error substituting variables in translation '{key}': {e}")
                # Try partial substitution - replace what we can
                for var_name, var_value in kwargs.items():
                    text = text.replace(f"{{{var_name}}}", str(var_value))
        
        return text
    
    def get_help_menu(self, locale: str = None) -> str:
        """Get formatted help menu text."""
        title = self.get_text("help_menu.title", locale)
        
        # Get individual command texts
        start_cmd = self.get_text("help_menu.commands.start", locale)
        pending_cmd = self.get_text("help_menu.commands.pending_reservations", locale)
        help_cmd = self.get_text("help_menu.commands.help", locale)
        language_cmd = self.get_text("help_menu.commands.language", locale)
        
        command_list = f"{start_cmd}\n{pending_cmd}\n{help_cmd}\n{language_cmd}"
        
        return f"<b>{title}</b>\n\n{command_list}"
    
    def get_reservation_info_template(self, locale: str = None) -> Dict[str, str]:
        """Get field names for reservation info formatting."""
        return {
            'reservation_id': self.get_text('pending_reservations.fields.reservation_id', locale),
            'client_name': self.get_text('pending_reservations.fields.client_name', locale),
            'contact': self.get_text('pending_reservations.fields.contact', locale),
            'time': self.get_text('pending_reservations.fields.time', locale),
            'party_size': self.get_text('pending_reservations.fields.party_size', locale),
            'status': self.get_text('pending_reservations.fields.status', locale)
        }

# Global instance
telegram_i18n = TelegramTranslationService()

async def get_admin_language(telegram_chat_id: int) -> str:
    """
    Get the preferred language for an admin based on their Telegram chat ID.
    Returns 'en' as default if admin not found or language not set.
    """
    # Import here to avoid circular imports
    from app.services.telegram_service import get_admin_by_telegram_id
    
    admin = await get_admin_by_telegram_id(telegram_chat_id)
    if admin and hasattr(admin, 'language') and admin.language:
        return admin.language
    return "en"  # Default to English
