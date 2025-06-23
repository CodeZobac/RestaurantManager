from fastapi import APIRouter, HTTPException
from ..schemas.reservation import (
    ReservationCreate,
    ReservationResponse,
    ReservationErrorResponse,
)
import os
import httpx
from datetime import datetime, timedelta

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

def get_supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post(
    "/",
    response_model=ReservationResponse,
    responses={400: {"model": ReservationErrorResponse}},
    status_code=201,
    summary="Create a reservation",
    description="Create a reservation if a table is available for the requested time and party size.",
)
async def create_reservation(reservation: ReservationCreate):
    try:
        # 1. Find available tables with enough capacity
        async with httpx.AsyncClient() as client:
            tables_resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/tables",
                headers=get_supabase_headers(),
            )
            tables_resp.raise_for_status()
            tables = tables_resp.json()

        suitable_tables = [
            t for t in tables if t.get("capacity", 0) >= reservation.party_size
        ]
        if not suitable_tables:
            return ReservationErrorResponse(error="No tables available for this party size")  # type: ignore

        # 2. Check reservations for each suitable table
        async with httpx.AsyncClient() as client:
            reservations_resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/reservations",
                headers=get_supabase_headers(),
            )
            reservations_resp.raise_for_status()
            reservations = reservations_resp.json()

        requested_time = reservation.reservation_time
        # Assume 2-hour slot per reservation
        slot_start = requested_time
        slot_end = requested_time + timedelta(hours=2)

        def is_conflict(existing):
            existing_time = datetime.fromisoformat(existing["reservation_time"])
            existing_start = existing_time
            existing_end = existing_time + timedelta(hours=2)
            # Overlap if slot_start < existing_end and slot_end > existing_start
            return (
                existing["table_id"] == table_id
                and slot_start < existing_end
                and slot_end > existing_start
            )

        available_table_id = None
        for table in suitable_tables:
            table_id = table["id"]
            conflict = any(
                r["table_id"] == table_id and
                slot_start < datetime.fromisoformat(r["reservation_time"]) + timedelta(hours=2) and
                slot_end > datetime.fromisoformat(r["reservation_time"])
                for r in reservations
            )
            if not conflict:
                available_table_id = table_id
                break

        if available_table_id is None:
            return ReservationErrorResponse(error="No tables available at the requested time")  # type: ignore

        # 3. Create reservation
        reservation_data = {
            "client_name": reservation.client_name,
            "client_contact": reservation.client_contact,
            "reservation_time": reservation.reservation_time.time().isoformat(),
            "reservation_date": reservation.reservation_time.date().isoformat(),
            "party_size": reservation.party_size,
            "table_id": available_table_id,
            "status": "pending",
            "customer_id": reservation.customer_id,
        }
        async with httpx.AsyncClient() as client:
            created_resp = await client.post(
                f"{SUPABASE_URL}/rest/v1/reservations",
                headers=get_supabase_headers(),
                json=reservation_data,
            )
            try:
                created_resp.raise_for_status()
            except httpx.HTTPStatusError as e:
                raise HTTPException(status_code=400, detail=f"Supabase POST error: {created_resp.text}") from e
            created = created_resp.json()
        created_res = created[0]
        return ReservationResponse(
            reservation_id=created_res["id"],
            status=created_res["status"],
            table_id=created_res["table_id"],
            message="Reservation created",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
