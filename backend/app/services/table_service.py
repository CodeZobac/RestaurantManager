"""Business logic for table management operations"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.exc import IntegrityError

from ..models.table import Table
from ..schemas.table import TableCreate, TableUpdate, TableResponse, JoinedTableResponse

class TableService:
    """Service class for table management business logic"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_table(self, table_data: TableCreate) -> Table:
        """
        Create a new table with auto-generated number if not provided
        """
        # Auto-generate table name if not provided
        table_name = table_data.name
        if not table_name:
            table_name = await self.get_next_table_number()
        
        # Check if table name already exists
        existing_table = await self.get_table_by_name(table_name)
        if existing_table:
            raise ValueError(f"Table with name '{table_name}' already exists")
        
        # Create new table instance
        new_table = Table(
            name=table_name,
            capacity=table_data.capacity,
            location=table_data.location,
            status=table_data.status
        )
        
        # Save to database
        try:
            self.db.add(new_table)
            await self.db.commit()
            await self.db.refresh(new_table)
            return new_table
        except IntegrityError as e:
            await self.db.rollback()
            raise ValueError(f"Failed to create table: {str(e)}")
    
    async def get_table_by_id(self, table_id: int) -> Optional[Table]:
        """
        Get a table by its ID
        """
        stmt = select(Table).where(Table.id == table_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_table_by_name(self, table_name: str) -> Optional[Table]:
        """
        Get a table by its name (e.g., T1, T2, etc.)
        """
        stmt = select(Table).where(Table.name == table_name)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_all_tables(
        self, 
        status: Optional[str] = None,
        location: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all tables, combining individual and joined tables into logical units
        """
        # Build query with optional filters
        stmt = select(Table)
        conditions = []
        
        if status:
            conditions.append(Table.status == status)
        if location:
            conditions.append(Table.location == location)
        
        if conditions:
            stmt = stmt.where(and_(*conditions))
        
        # Execute query
        result = await self.db.execute(stmt)
        all_tables = result.scalars().all()
        
        # Separate individual tables from joined tables
        individual_tables = []
        joined_groups = {}
        
        for table in all_tables:
            if table.is_joined and table.joined_group_id:
                # Group joined tables
                if table.joined_group_id not in joined_groups:
                    joined_groups[table.joined_group_id] = []
                joined_groups[table.joined_group_id].append(table)
            else:
                # Individual table
                individual_tables.append({
                    "type": "individual",
                    "table": table
                })
        
        # Process joined groups into single units
        processed_joined_groups = []
        for group_id, tables in joined_groups.items():
            # Calculate combined capacity and get common properties
            total_capacity = sum(table.capacity for table in tables)
            table_names = sorted([table.name for table in tables])
            
            # Use properties from first table (they should be consistent)
            first_table = tables[0]
            
            processed_joined_groups.append({
                "type": "joined",
                "group": {
                    "id": group_id,
                    "number": "+".join(table_names),
                    "capacity": total_capacity,
                    "status": first_table.status,
                    "is_joined": True,
                    "joined_tables": table_names,
                    "location": first_table.location,
                    "created_at": first_table.created_at
                }
            })
        
        # Combine results
        result_list = individual_tables + processed_joined_groups
        return result_list
    
    async def update_table(self, table_id: int, update_data: TableUpdate) -> Optional[Table]:
        """
        Update an existing table
        """
        # Find table by ID
        table = await self.get_table_by_id(table_id)
        if not table:
            return None
        
        # Check name uniqueness if name is being updated
        if update_data.name and update_data.name != table.name:
            existing_table = await self.get_table_by_name(update_data.name)
            if existing_table:
                raise ValueError(f"Table with name '{update_data.name}' already exists")
        
        # Update only provided fields
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(table, field, value)
        
        # Save changes
        try:
            await self.db.commit()
            await self.db.refresh(table)
            return table
        except IntegrityError as e:
            await self.db.rollback()
            raise ValueError(f"Failed to update table: {str(e)}")
    
    async def delete_table(self, table_id: int) -> bool:
        """
        Delete a table
        """
        # Find table by ID
        table = await self.get_table_by_id(table_id)
        if not table:
            return False
        
        # Check if table has active reservations (business rule)
        if table.status == "reserved":
            raise ValueError("Cannot delete table with active reservations")
        
        # If table is part of joined group, unjoin first
        if table.is_joined and table.joined_group_id:
            await self.unjoin_tables(table.joined_group_id)
            # Refresh table after unjoining
            await self.db.refresh(table)
        
        # Delete table from database
        try:
            await self.db.delete(table)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            raise ValueError(f"Failed to delete table: {str(e)}")
    
    async def join_tables(self, table_numbers: List[str]) -> Dict[str, Any]:
        """
        Join multiple tables together to create a larger seating area
        """
        # Validate tables first
        validation = await self.validate_tables_for_joining(table_numbers)
        if not validation["valid"]:
            raise ValueError(validation["error"])
        
        tables = validation["tables"]
        
        # Sort table numbers for consistent group ID
        sorted_table_numbers = sorted(table_numbers)
        joined_group_id = "-".join(sorted_table_numbers)
        
        # Calculate combined capacity
        total_capacity = sum(table.capacity for table in tables)
        
        # Update all tables with joined status
        try:
            for table in tables:
                table.is_joined = True
                table.joined_group_id = joined_group_id
                # Keep individual table capacity for unjoining later
            
            await self.db.commit()
            
            # Return joined table group information
            return {
                "id": joined_group_id,
                "number": "+".join(sorted_table_numbers),
                "capacity": total_capacity,
                "status": "available",  # All tables were validated as available
                "is_joined": True,
                "joined_tables": sorted_table_numbers,
                "location": tables[0].location if tables[0].location else None,
                "created_at": tables[0].created_at  # Use first table's creation time
            }
        except Exception as e:
            await self.db.rollback()
            raise ValueError(f"Failed to join tables: {str(e)}")
    
    async def unjoin_tables(self, joined_group_id: str) -> List[Table]:
        """
        Unjoin a group of tables back to individual tables
        """
        # Find all tables with the given joined_group_id
        stmt = select(Table).where(Table.joined_group_id == joined_group_id)
        result = await self.db.execute(stmt)
        tables = result.scalars().all()
        
        if not tables:
            raise ValueError(f"No joined table group found with ID: {joined_group_id}")
        
        # Reset is_joined to False and joined_group_id to None
        try:
            for table in tables:
                table.is_joined = False
                table.joined_group_id = None
                # Keep the current capacity - don't reset to default
                # The capacity might have been manually adjusted
            
            await self.db.commit()
            
            # Refresh all tables to get updated data
            for table in tables:
                await self.db.refresh(table)
            
            return list(tables)
        except Exception as e:
            await self.db.rollback()
            raise ValueError(f"Failed to unjoin tables: {str(e)}")
    
    async def get_next_table_number(self) -> str:
        """
        Generate the next available table number (T1, T2, T3, etc.)
        """
        # Query all existing table names
        stmt = select(Table.name).where(Table.name.like('T%'))
        result = await self.db.execute(stmt)
        existing_names = result.scalars().all()
        
        # Extract numbers from table names (T1 -> 1, T2 -> 2, etc.)
        existing_numbers = []
        for name in existing_names:
            if name.startswith('T') and name[1:].isdigit():
                existing_numbers.append(int(name[1:]))
        
        # Find the next available number
        if not existing_numbers:
            next_number = 1
        else:
            next_number = max(existing_numbers) + 1
        
        return f"T{next_number}"
    
    async def validate_tables_for_joining(self, table_numbers: List[str]) -> Dict[str, Any]:
        """
        Validate that tables can be joined together
        """
        if len(table_numbers) < 2:
            return {"valid": False, "error": "At least 2 tables are required for joining"}
        
        # Check all tables exist
        tables = []
        for table_number in table_numbers:
            table = await self.get_table_by_name(table_number)
            if not table:
                return {"valid": False, "error": f"Table '{table_number}' does not exist"}
            tables.append(table)
        
        # Check all tables are available
        for table in tables:
            if table.status != "available":
                return {"valid": False, "error": f"Table '{table.name}' is not available (status: {table.status})"}
        
        # Check no tables are already joined
        for table in tables:
            if table.is_joined:
                return {"valid": False, "error": f"Table '{table.name}' is already part of a joined group"}
        
        # Check tables are in compatible locations (optional business rule)
        locations = [table.location for table in tables if table.location]
        if len(set(locations)) > 1:
            return {"valid": False, "error": "Tables must be in the same location to be joined"}
        
        return {"valid": True, "tables": tables}
    
    async def get_table_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about tables
        """
        # Get all tables
        stmt = select(Table)
        result = await self.db.execute(stmt)
        all_tables = result.scalars().all()
        
        # Basic counts
        total_tables = len(all_tables)
        individual_tables = len([t for t in all_tables if not t.is_joined])
        joined_table_count = len([t for t in all_tables if t.is_joined])
        
        # Count unique joined groups
        joined_groups = set()
        for table in all_tables:
            if table.is_joined and table.joined_group_id:
                joined_groups.add(table.joined_group_id)
        joined_groups_count = len(joined_groups)
        
        # Total capacity
        total_capacity = sum(table.capacity for table in all_tables)
        
        # Tables by status
        status_counts = {}
        for table in all_tables:
            status = table.status
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Tables by location
        location_counts = {}
        for table in all_tables:
            location = table.location or "No Location"
            location_counts[location] = location_counts.get(location, 0) + 1
        
        return {
            "total_tables": total_tables,
            "individual_tables": individual_tables,
            "joined_tables": joined_table_count,
            "joined_groups": joined_groups_count,
            "total_capacity": total_capacity,
            "average_capacity": round(total_capacity / total_tables, 2) if total_tables > 0 else 0,
            "tables_by_status": status_counts,
            "tables_by_location": location_counts
        }
