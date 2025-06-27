from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class TableBase(BaseModel):
    """Base table schema with common fields"""
    name: str = Field(..., description="Table identifier (e.g., T1, T2, T3)")
    capacity: int = Field(default=2, ge=1, description="Maximum number of guests")
    location: Optional[str] = Field(None, description="Physical location in restaurant")
    status: str = Field(default="available", description="Table status")

class TableCreate(TableBase):
    """Schema for creating a new table"""
    restaurant_id: str = Field(..., description="ID of the restaurant this table belongs to")
    name: Optional[str] = Field(None, description="Table identifier (e.g., T1, T2, T3). Auto-generated if not provided.")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "capacity": 2,
                "location": "Main Dining",
                "status": "available",
                "restaurant_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            }
        }
    )

class TableUpdate(BaseModel):
    """Schema for updating an existing table"""
    name: Optional[str] = Field(None, description="Table identifier")
    capacity: Optional[int] = Field(None, ge=1, description="Maximum number of guests")
    location: Optional[str] = Field(None, description="Physical location in restaurant")
    status: Optional[str] = Field(None, description="Table status")
    restaurant_id: Optional[str] = Field(None, description="ID of the restaurant this table belongs to")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "capacity": 4,
                "location": "Patio",
                "status": "maintenance",
                "restaurant_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
            }
        }
    )

class TableResponse(TableBase):
    """Schema for table responses"""
    id: int = Field(..., description="Table database ID")
    is_joined: bool = Field(default=False, description="Whether table is part of a joined group")
    joined_group_id: Optional[str] = Field(None, description="Joined table group identifier")
    created_at: datetime = Field(..., description="When the table was created")
    updated_at: datetime = Field(..., description="When the table was last updated")
    
    model_config = ConfigDict(from_attributes=True)

class JoinedTableResponse(BaseModel):
    """Schema for joined table unit responses"""
    id: str = Field(..., description="Combined table identifier (e.g., T1-T2-T3)")
    number: str = Field(..., description="Display name (e.g., T1+T2+T3)")
    capacity: int = Field(..., description="Combined capacity of all joined tables")
    status: str = Field(..., description="Status of the joined table unit")
    is_joined: bool = Field(True, description="Always true for joined tables")
    joined_tables: List[str] = Field(..., description="List of individual table numbers")
    location: Optional[str] = Field(None, description="Common location if all tables in same area")
    created_at: datetime = Field(..., description="When the joined group was created")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "T1-T2-T3",
                "number": "T1+T2+T3",
                "capacity": 6,
                "status": "available",
                "is_joined": True,
                "joined_tables": ["T1", "T2", "T3"],
                "location": "Main Dining",
                "created_at": "2025-06-23T10:00:00Z"
            }
        }
    )

class TableListResponse(BaseModel):
    """Schema for listing tables (includes both individual and joined tables)"""
    tables: List[TableResponse | JoinedTableResponse] = Field(..., description="List of tables")
    total: int = Field(..., description="Total number of table units")
    individual_tables: int = Field(..., description="Number of individual tables")
    joined_groups: int = Field(..., description="Number of joined table groups")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "tables": [
                    {
                        "id": 1,
                        "name": "T1",
                        "capacity": 2,
                        "location": "Main Dining",
                        "status": "available",
                        "is_joined": False,
                        "joined_group_id": None,
                        "created_at": "2025-06-23T10:00:00Z",
                        "updated_at": "2025-06-23T10:00:00Z"
                    },
                    {
                        "id": "T2-T3",
                        "number": "T2+T3",
                        "capacity": 4,
                        "status": "available",
                        "is_joined": True,
                        "joined_tables": ["T2", "T3"],
                        "location": "Patio",
                        "created_at": "2025-06-23T10:30:00Z"
                    }
                ],
                "total": 2,
                "individual_tables": 1,
                "joined_groups": 1
            }
        }
    )

class TableJoinRequest(BaseModel):
    """Schema for joining tables together"""
    table_numbers: List[str] = Field(
        ..., 
        min_length=2,
        description="List of table numbers to join together (e.g., ['T1', 'T2', 'T3'])"
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "table_numbers": ["T1", "T2", "T3"]
            }
        }
    )

class TableUnjoinRequest(BaseModel):
    """Schema for unjoining tables"""
    joined_group_id: str = Field(
        ...,
        description="Joined table group identifier to unjoin (e.g., 'T1-T2-T3')"
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "joined_group_id": "T1-T2-T3"
            }
        }
    )

class TableStatusUpdate(BaseModel):
    """Schema for updating table status"""
    status: str = Field(..., description="New table status")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "maintenance"
            }
        }
    )

class ApiResponse(BaseModel):
    """Generic API response schema"""
    message: str = Field(..., description="Response message")
    success: bool = Field(True, description="Whether operation was successful")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "Operation completed successfully",
                "success": True
            }
        }
    )
