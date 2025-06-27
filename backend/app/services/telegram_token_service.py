import logging
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# In-memory token store (for production, use Redis or database)
telegram_tokens: Dict[str, Dict[str, Any]] = {}


def generate_telegram_token(admin_id: str, bot_username: str) -> Dict[str, str]:
    """
    Generate a unique token for Telegram deep linking.
    This token will be used to associate a Telegram chat_id with an admin user.
    """
    # Generate a secure random token
    token = secrets.token_urlsafe(16)

    # Store token with expiration (5 minutes)
    expiry = datetime.utcnow() + timedelta(minutes=5)
    telegram_tokens[token] = {
        "admin_id": admin_id,
        "expires_at": expiry,
        "used": False
    }

    logger.info(f"Generated Telegram token for admin {admin_id}: {token}")

    return {
        "token": token,
        "expires_at": expiry.isoformat(),
        "deep_link": f"https://t.me/{bot_username}?start={token}"
    }


def get_token_info(token: str) -> Optional[Dict[str, Any]]:
    """
    Get information about a Telegram token.
    """
    return telegram_tokens.get(token)


def consume_telegram_token(token: str) -> Optional[str]:
    """
    Consume a Telegram token and return the associated admin_id.
    Returns None if token is invalid, expired, or already used.
    """
    if token not in telegram_tokens:
        logger.warning(f"Token not found: {token}")
        return None

    token_data = telegram_tokens[token]

    # Check if token is expired
    if datetime.utcnow() > token_data["expires_at"]:
        logger.warning(f"Token expired: {token}")
        del telegram_tokens[token]
        return None

    # Check if token is already used
    if token_data["used"]:
        logger.warning(f"Token already used: {token}")
        return None

    # Mark token as used
    token_data["used"] = True
    admin_id = token_data["admin_id"]

    # Clean up token after use
    del telegram_tokens[token]

    logger.info(f"Token consumed successfully: {token} for admin {admin_id}")
    return admin_id


def cleanup_expired_tokens():
    """Remove expired tokens from memory."""
    current_time = datetime.utcnow()
    expired_tokens = [
        token for token, data in telegram_tokens.items()
        if current_time > data["expires_at"]
    ]

    for token in expired_tokens:
        del telegram_tokens[token]

    if expired_tokens:
        logger.info(f"Cleaned up {len(expired_tokens)} expired tokens")
