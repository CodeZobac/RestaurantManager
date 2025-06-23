"""API routes for table management using Supabase REST API"""

from typing import List
from fastapi import APIRouter, HTTPException
from ..schemas.table import TableCreate, TableUpdate, TableResponse
from ..supabase_client import (
    supabase_get,
    supabase_post,
    supabase_patch,
    supabase_delete,
)

router = APIRouter(prefix="/tables", tags=["tables"])


@router.get(
    "/",
    response_model=List[TableResponse],
    summary="Get all tables",
    description="Retrieve all tables with optional filtering. Joined tables are shown as single units.",
)
async def get_tables():
    """
    Get all tables with optional filtering
    """
    try:
        data = await supabase_get("tables")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/",
    response_model=TableResponse,
    status_code=201,
    summary="Create a new table",
    description="Create a new restaurant table. Table number will be auto-generated if not provided (T1, T2, T3, etc.)",
)
async def create_table(table: TableCreate) -> TableResponse:
    """
    Create a new table
    """
    try:
        data = await supabase_post(
            "tables", table.model_dump(exclude_unset=True, exclude_none=True)
        )
        return data[0]  # Supabase returns a list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch(
    "/{table_id}",
    response_model=TableResponse,
    summary="Update table",
    description="Update a table's properties (capacity, location, status, etc.)",
)
async def update_table(table_id: int, table: TableUpdate) -> TableResponse:
    """
    Update an existing table
    """
    try:
        data = await supabase_patch(
            "tables", table_id, table.model_dump(exclude_unset=True, exclude_none=True)
        )
        return data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete(
    "/{table_id}",
    summary="Delete table",
    description="Delete a table. Will check for active reservations before deletion.",
)
async def delete_table(table_id: int):
    """
    Delete a table
    """
    try:
        await supabase_delete("tables", table_id)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
