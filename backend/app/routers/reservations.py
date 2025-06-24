from fastapi import APIRouter, Query, HTTPException
from datetime import date
from app.supabase_client import supabase_get
from app.schemas.reservation import DashboardStatusResponse, Reservation, DashboardTable, ReservationSummary
from app.core.logger import logger

router = APIRouter()

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