"""API routes for table management using Supabase REST API"""

from typing import List
from fastapi import APIRouter, HTTPException
import httpx # Import httpx
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
    except httpx.HTTPStatusError as e:
        # Supabase API returned an error
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text) from e
    except Exception as e:
        # Other unexpected errors
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}") from e


async def _generate_table_name() -> str:
    """
    Generates the next available table name (e.g., T1, T2, T3, etc.)
    by querying existing tables.
    """
    try:
        existing_tables = await supabase_get("tables", params={"select": "name"})
        
        # Extract numbers from existing table names (e.g., "T1" -> 1)
        table_numbers = []
        for t in existing_tables:
            if t and t.get("name", "").startswith("T"):
                try:
                    num = int(t["name"][1:])
                    table_numbers.append(num)
                except ValueError:
                    # Ignore names that don't follow the T<number> format
                    pass
        
        next_number = 1
        if table_numbers:
            next_number = max(table_numbers) + 1
            
        return f"T{next_number}"
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Failed to generate table name: {e.response.text}") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while generating table name: {str(e)}") from e


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
        if table.name is None:
            table.name = await _generate_table_name()
            
        data = await supabase_post(
            "tables", table.model_dump(exclude_unset=True, exclude_none=True)
        )
        return data[0]  # Supabase returns a list
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}") from e


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
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}") from e


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
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}") from e
