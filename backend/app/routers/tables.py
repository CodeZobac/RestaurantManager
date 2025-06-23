"""API routes for table management"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_database_session
from ..services.table_service import TableService
from ..schemas.table import (
    TableCreate,
    TableUpdate, 
    TableResponse,
    TableListResponse,
    TableJoinRequest,
    TableUnjoinRequest,
    ApiResponse,
    JoinedTableResponse
)

router = APIRouter(prefix="/tables", tags=["tables"])

@router.post(
    "/",
    response_model=TableResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new table",
    description="Create a new restaurant table. Table number will be auto-generated if not provided (T1, T2, T3, etc.)"
)
async def create_table(
    table_data: TableCreate,
    db: AsyncSession = Depends(get_database_session)
) -> TableResponse:
    """
    Create a new table
    """
    service = TableService(db)
    try:
        table = await service.create_table(table_data)
        return TableResponse.model_validate(table)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create table")

@router.get(
    "/",
    response_model=TableListResponse,
    summary="Get all tables",
    description="Retrieve all tables with optional filtering. Joined tables are shown as single units."
)
async def get_tables(
    status: Optional[str] = Query(None, description="Filter by table status"),
    location: Optional[str] = Query(None, description="Filter by table location"),
    db: AsyncSession = Depends(get_database_session)
) -> TableListResponse:
    """
    Get all tables with optional filtering
    """
    service = TableService(db)
    try:
        tables_data = await service.get_all_tables(status=status, location=location)
        
        # Process response to separate individual and joined tables
        processed_tables = []
        individual_count = 0
        joined_groups_count = 0
        
        for item in tables_data:
            if item["type"] == "individual":
                # Individual table
                table = item["table"]
                processed_tables.append(TableResponse.model_validate(table))
                individual_count += 1
            elif item["type"] == "joined":
                # Joined table group
                group_data = item["group"]
                processed_tables.append(JoinedTableResponse(**group_data))
                joined_groups_count += 1
        
        return TableListResponse(
            tables=processed_tables,
            total=len(processed_tables),
            individual_tables=individual_count,
            joined_groups=joined_groups_count
        )
    except Exception as e:
        import traceback
        error_detail = f"Failed to retrieve tables: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR in get_tables: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve tables: {str(e)}")

@router.get(
    "/{table_id}",
    response_model=TableResponse,
    summary="Get table by ID",
    description="Retrieve a specific table by its database ID"
)
async def get_table(
    table_id: int,
    db: AsyncSession = Depends(get_database_session)
) -> TableResponse:
    """
    Get a specific table by ID
    """
    service = TableService(db)
    table = await service.get_table_by_id(table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return TableResponse.model_validate(table)

@router.put(
    "/{table_id}",
    response_model=TableResponse,
    summary="Update table",
    description="Update a table's properties (capacity, location, status, etc.)"
)
async def update_table(
    table_id: int,
    update_data: TableUpdate,
    db: AsyncSession = Depends(get_database_session)
) -> TableResponse:
    """
    Update an existing table
    """
    service = TableService(db)
    try:
        table = await service.update_table(table_id, update_data)
        if not table:
            raise HTTPException(status_code=404, detail="Table not found")
        return TableResponse.model_validate(table)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update table")

@router.delete(
    "/{table_id}",
    response_model=ApiResponse,
    summary="Delete table",
    description="Delete a table. Will check for active reservations before deletion."
)
async def delete_table(
    table_id: int,
    db: AsyncSession = Depends(get_database_session)
) -> ApiResponse:
    """
    Delete a table
    """
    service = TableService(db)
    try:
        success = await service.delete_table(table_id)
        if not success:
            raise HTTPException(status_code=404, detail="Table not found")
        return ApiResponse(message="Table deleted successfully")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete table")

@router.post(
    "/join",
    response_model=JoinedTableResponse,
    summary="Join tables",
    description="Join multiple tables together to create a larger seating area"
)
async def join_tables(
    join_request: TableJoinRequest,
    db: AsyncSession = Depends(get_database_session)
) -> JoinedTableResponse:
    """
    Join multiple tables together
    """
    service = TableService(db)
    try:
        # Join tables (validation is handled inside the service)
        joined_group = await service.join_tables(join_request.table_numbers)
        return JoinedTableResponse(**joined_group)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to join tables")

@router.post(
    "/unjoin",
    response_model=List[TableResponse],
    summary="Unjoin tables",
    description="Separate a joined table group back into individual tables"
)
async def unjoin_tables(
    unjoin_request: TableUnjoinRequest,
    db: AsyncSession = Depends(get_database_session)
) -> List[TableResponse]:
    """
    Unjoin a group of tables
    """
    service = TableService(db)
    try:
        tables = await service.unjoin_tables(unjoin_request.joined_group_id)
        return [TableResponse.model_validate(table) for table in tables]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to unjoin tables")

@router.get(
    "/statistics",
    summary="Get table statistics",
    description="Get various statistics about restaurant tables"
)
async def get_table_statistics(
    db: AsyncSession = Depends(get_database_session)
) -> dict:
    """
    Get table statistics
    """
    service = TableService(db)
    try:
        stats = await service.get_table_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get statistics")
