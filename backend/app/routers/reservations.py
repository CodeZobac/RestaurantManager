from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Query
from ..schemas.reservation import (
    ReservationCreate,
    ReservationResponse,
    ReservationErrorResponse,
    DashboardStatusResponse,
)
from ..schemas.admin import Admin
from app.services.reservation_service import reservation_service
from app.services.telegram_service import telegram_service, get_admin_by_telegram_id
from app.services.restaurant_service import restaurant_service
from app.supabase_client import supabase_get
from datetime import datetime, timedelta, date
from typing import Optional, List

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post(
    "/",
    response_model=ReservationResponse,
    responses={400: {"model": ReservationErrorResponse}},
    status_code=201,
    summary="Create a reservation",
    description="Create a reservation if a table is available for the requested time and party size.",
)
async def create_reservation(reservation: ReservationCreate, background_tasks: BackgroundTasks):
    tables_params = {
        "capacity": f"gte.{reservation.party_size}",
        "restaurant_id": f"eq.{reservation.restaurant_id}"
    }
    tables = await supabase_get("tables", params=tables_params)

    suitable_tables = [t for t in tables if t.get("capacity", 0) >= reservation.party_size]
    if not suitable_tables:
        raise HTTPException(
            status_code=400,
            detail=ReservationErrorResponse(error="No tables available for this party size at the specified restaurant").dict()
        )



    tables_for_reservations_params = {"restaurant_id": f"eq.{reservation.restaurant_id}"}
    tables_for_reservations_data = await supabase_get("tables", params=tables_for_reservations_params)
    table_ids_for_reservations = [table["id"] for table in tables_for_reservations_data]

    reservations = []
    if table_ids_for_reservations:
        reservations_params = {"table_id": f"in.({','.join(map(str, table_ids_for_reservations))})"}
        reservations = await supabase_get("reservations", params=reservations_params)

    requested_datetime = datetime.combine(reservation.reservation_date, reservation.reservation_time)

    slot_start = requested_datetime
    slot_end = requested_datetime + timedelta(hours=2)

    def is_conflict(existing, current_table_id):
        full_datetime_str = f"{existing['reservation_date']}T{existing['reservation_time']}"
        existing_time = datetime.fromisoformat(full_datetime_str)
        if existing_time.tzinfo is not None:
            existing_time = existing_time.replace(tzinfo=None)
            
        existing_start = existing_time
        existing_end = existing_time + timedelta(hours=2)
        return (
            existing["table_id"] == current_table_id
            and slot_start < existing_end
            and slot_end > existing_start
        )

    available_table_id = None
    for table in suitable_tables:
        table_id = table["id"]
        conflict = any(
            is_conflict(r, table_id)
            for r in reservations
        )
        if not conflict:
            available_table_id = table_id
            break

    if available_table_id is None:
        raise HTTPException(
            status_code=400,
            detail=ReservationErrorResponse(error="No tables available at the requested time for the specified restaurant").dict()
        )


    reservation_data_for_service = ReservationCreate(
        client_name=reservation.client_name,
        client_contact=reservation.client_contact,
        reservation_date=reservation.reservation_date,
        reservation_time=reservation.reservation_time,
        party_size=reservation.party_size,
        customer_id=reservation.customer_id,
        restaurant_id=reservation.restaurant_id,
        table_id=available_table_id
    )
    
    created_res = await reservation_service.create_reservation(reservation_data_for_service)

    if not created_res:
        raise HTTPException(status_code=400, detail="Failed to create reservation.")


    if created_res.status == "pending" and telegram_service:
        restaurant = await restaurant_service.get_restaurant_by_id(created_res.restaurant_id)
        restaurant_name = restaurant.name if restaurant else "Unknown Restaurant"
        reservation_datetime = datetime.combine(created_res.reservation_date, created_res.reservation_time)
        reservation_info = (
            f"<b>New pending reservation:</b>\n"
            f"Restaurant: {restaurant_name}\n"
            f"Reservation ID: {created_res.id}\n"
            f"Client Name: {created_res.client_name}\n"
            f"Contact: {created_res.client_contact}\n"
            f"Time: {reservation_datetime.strftime('%Y-%m-%d %H:%M')}\n"
            f"Party Size: {created_res.party_size}\n"
            f"Status: {created_res.status}"
        )

        try:
            admins_params = {
                "restaurant_id": f"eq.{created_res.restaurant_id}",
                "telegram_chat_id": "not.is.null"
            }
            admins = await supabase_get("admins", params=admins_params)
            
            for admin in admins:
                chat_id = admin.get("telegram_chat_id")
                if chat_id:
                    background_tasks.add_task(
                        telegram_service.send_reservation_notification,
                        chat_id,
                        str(created_res.id),
                        reservation_info
                    )

        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send Telegram notification to admins for restaurant {created_res.restaurant_id}: {e}")

    return ReservationResponse(
        reservation_id=created_res.id,
        status=created_res.status,
        table_id=created_res.table_id,
        message="Reservation created",
    )


@router.get(
    "/pending",
    response_model=List[ReservationResponse],
    summary="Get pending reservations",
    description="Retrieve a list of all pending reservations, filtered by restaurant for authorized admins.",
)
async def get_pending_reservations(
    restaurant_id: Optional[str] = None,
    current_admin: Admin = Depends(get_admin_by_telegram_id)
):
    if current_admin and current_admin.restaurant_id:
        if restaurant_id and restaurant_id != current_admin.restaurant_id:
            raise HTTPException(status_code=403, detail="Unauthorized to view reservations for this restaurant.")
        reservations = await reservation_service.get_pending_reservations(current_admin.restaurant_id)
    elif restaurant_id:
        reservations = await reservation_service.get_pending_reservations(restaurant_id)
    else:
        reservations = await reservation_service.get_pending_reservations()
    
    return [
        ReservationResponse(
            reservation_id=res.id,
            status=res.status,
            table_id=res.table_id,
            message="Pending reservation details"
        ) for res in reservations
    ]


@router.get("/api/v1/dashboard-status", response_model=DashboardStatusResponse)
async def dashboard_status(date: date = Query(...)):
    try:
        # Fetch all tables
        tables_data = await supabase_get("tables")
        logger.debug(f"Supabase tables: {tables_data}")

        # Fetch reservations for the date
        reservations_data = await supabase_get("reservations", {"reservation_date": f"eq.{date}"})
        logger.debug(f"Supabase reservations: {reservations_data}")

        # Map reservations by table_id for quick lookup
        reservations_by_table = {r["table_id"]: r for r in reservations_data}

        # Compose dashboard tables with status and filtered fields
        dashboard_tables = []
        for table in tables_data:
            reservation = reservations_by_table.get(table["id"])
            status = reservation["status"] if reservation else "available"
            
            table_data = {
                "id": table["id"],
                "name": table["name"],
                "capacity": table["capacity"],
                "location": table.get("location"),
                "status": status,
            }
            
            if reservation:
                table_data["reservation"] = {
                    "id": reservation["id"],
                    "customer_name": reservation.get("customer_name") or reservation.get("client_name") or "",
                    "reservation_time": reservation["reservation_time"],
                    "party_size": reservation["party_size"],
                }
            
            dashboard_tables.append(table_data)

        logger.debug(f"Dashboard tables count: {len(dashboard_tables)}")
        logger.debug(f"Dashboard response structure: date={date}, tables_count={len(dashboard_tables)}, reservations_count={len(reservations_data)}")

        # Return the properly structured response
        response = {
            "date": str(date),
            "tables": dashboard_tables,
            "reservations": reservations_data
        }
        
        logger.debug(f"Final response: {response}")
        return response
        
    except Exception as e:
        logger.error(f"Dashboard status error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
