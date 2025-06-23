"""SQLAlchemy model for restaurant tables"""

from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Boolean, CheckConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import sqltypes

from ..core.database import Base


class Table(Base):
    """
    Restaurant table model
    
    Represents a physical table in the restaurant that can be reserved.
    Tables are numbered as T1, T2, T3, etc. and can be joined together
    for larger parties.
    """
    __tablename__ = "tables"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    
    # Table identifier (T1, T2, T3, etc.)
    name: Mapped[str] = mapped_column(
        String(100), 
        unique=True, 
        nullable=False,
        comment="Table identifier (e.g., T1, T2, T3)"
    )
    
    # Table capacity (default 2, can be modified when joining tables)
    capacity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=2,
        comment="Maximum number of guests"
    )
    
    # Table location in restaurant
    location: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
        comment="Physical location in restaurant (e.g., 'Patio', 'Main Dining')"
    )
    
    # Table status
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="available",
        comment="Table status: 'available', 'maintenance', 'reserved'"
    )
    
    # Table joining functionality
    is_joined: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Whether this table is part of a joined group"
    )
    
    # Reference to joined table group
    joined_group_id: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Identifier for joined table group (e.g., 'T1-T2-T3')"
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        sqltypes.TIMESTAMP(timezone=True),
        nullable=False,
        default=func.now(),
        comment="When the table was created"
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        sqltypes.TIMESTAMP(timezone=True),
        nullable=False,
        default=func.now(),
        onupdate=func.now(),
        comment="When the table was last updated"
    )
    
    # Table constraints
    __table_args__ = (
        CheckConstraint("capacity > 0", name="check_capacity_positive"),
        CheckConstraint(
            "status IN ('available', 'maintenance', 'reserved')",
            name="check_valid_status"
        ),
    )
    
    def __repr__(self) -> str:
        return f"<Table {self.name} (capacity: {self.capacity}, status: {self.status})>"
    
    def __str__(self) -> str:
        return self.name
    
    @property
    def is_available(self) -> bool:
        """Check if table is available for reservation"""
        return self.status == "available"
    
    @property
    def display_name(self) -> str:
        """Get display name for the table"""
        if self.is_joined and self.joined_group_id:
            return self.joined_group_id
        return self.name
