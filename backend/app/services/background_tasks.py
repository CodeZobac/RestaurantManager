import logging
import asyncio
from app.services.reservation_service import reservation_service
from app.services.telegram_service import telegram_service
from app.supabase_client import supabase_patch, supabase_get

logger = logging.getLogger(__name__)

async def check_and_send_pending_reservations():
    """
    Checks for pending reservations and sends notifications to admins.
    """
    logger.info("Checking for pending reservations...")
    try:
        pending_reservations = await reservation_service.get_pending_reservations()
        if not pending_reservations:
            logger.info("No pending reservations to notify.")
            return

        for reservation in pending_reservations:
            if not reservation.table_id:
                continue

            tables_data = await supabase_get("tables", params={"id": f"eq.{reservation.table_id}"})
            if not tables_data:
                continue

            restaurant_id = tables_data[0].get("restaurant_id")
            if not restaurant_id:
                continue

            admins_data = await supabase_get("admins", params={"restaurant_id": f"eq.{restaurant_id}"})
            if not admins_data:
                continue

            for admin in admins_data:
                if admin.get("telegram_chat_id") and telegram_service:
                    reservation_info = (
                        f"<b>Reservation ID:</b> {reservation.id}\n"
                        f"<b>Client Name:</b> {reservation.client_name}\n"
                        f"<b>Contact:</b> {reservation.client_contact}\n"
                        f"<b>Time:</b> {reservation.reservation_date} {reservation.reservation_time}\n"
                        f"<b>Party Size:</b> {reservation.party_size}"
                    )
                    await telegram_service.send_reservation_notification(
                        chat_id=admin["telegram_chat_id"],
                        reservation_id=str(reservation.id),
                        reservation_info=reservation_info,
                    )

            await supabase_patch(
                "reservations",
                row_id=reservation.id,
                data={"reminder_sent": True},
                id_column="id",
            )
            logger.info(f"Notification sent for reservation {reservation.id}")

    except Exception as e:
        logger.error(f"Error in background task: {e}", exc_info=True)

async def main_task():
    """
    Main background task that runs periodically.
    """
    while True:
        await check_and_send_pending_reservations()
        await asyncio.sleep(60)  # Check every 60 seconds
