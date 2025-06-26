'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DashboardTable } from '@/lib/types';
import { TableCard } from './table-card';

interface TableGridProps {
  tables: DashboardTable[];
  onTableClick?: (table: DashboardTable) => void;
}

// Draggable Table Card Component
function DraggableTableCard({ table, onTableClick }: { table: DashboardTable; onTableClick?: (table: DashboardTable) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: table.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none" // Prevents touch scrolling conflicts
    >
      <TableCard
        table={table}
        onClick={onTableClick ? () => onTableClick(table) : undefined}
      />
    </div>
  );
}

export function TableGrid({ tables, onTableClick }: TableGridProps) {
  const [sortedTables, setSortedTables] = useState(tables);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update sorted tables when tables prop changes
  React.useEffect(() => {
    setSortedTables(tables);
  }, [tables]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSortedTables((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  if (sortedTables.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No tables found</p>
      </div>
    );
  }

  // Group tables by location for better organization
  const locationGroups = sortedTables.reduce((groups, table) => {
    const location = table.location || 'No Location';
    if (!groups[location]) {
      groups[location] = [];
    }
    groups[location].push(table);
    return groups;
  }, {} as Record<string, DashboardTable[]>);

  return (
    <div className="space-y-8">
      {Object.entries(locationGroups).map(([location, locationTables]) => (
        <div key={location} className="space-y-4">
          {/* Location Header */}
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <h3 className="text-lg font-semibold text-gray-800">{location}</h3>
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500">{locationTables.length} tables</span>
          </div>
          
          {/* Draggable Tables Grid */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={locationTables.map(t => t.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {locationTables.map((table) => (
                  <DraggableTableCard
                    key={table.id}
                    table={table}
                    onTableClick={onTableClick}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ))}
    </div>
  );
}
