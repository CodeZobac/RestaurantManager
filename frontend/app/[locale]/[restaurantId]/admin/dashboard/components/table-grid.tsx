/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DisplayTable, DashboardTable } from '@/lib/types';
import { TableCard } from './table-card';

interface TableGridProps {
  tables: DisplayTable[];
  onEditReservation?: (table: DashboardTable) => void;
  onCreateReservation?: (table: any) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onUnmerge: (groupId: string) => void;
}

function DraggableTableCard({
  table,
  onEditReservation,
  onCreateReservation,
  onUnmerge,
}: {
  table: DisplayTable;
  onEditReservation?: (table: DashboardTable) => void;
  onCreateReservation?: (table: any) => void;
  onUnmerge: (groupId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: table.id, data: { type: 'table' } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { setNodeRef: droppableRef } = useDroppable({
    id: table.id,
  });

  return (
    <div ref={droppableRef}>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="touch-none"
      >
        <TableCard
          table={table}
          onEditReservation={onEditReservation}
          onCreateReservation={onCreateReservation}
          onUnmerge={onUnmerge}
        />
      </div>
    </div>
  );
}

export function TableGrid({
  tables,
  onEditReservation,
  onCreateReservation,
  onDragEnd,
  onUnmerge,
}: TableGridProps) {
  const [sortedTables, setSortedTables] = useState(tables);

  useEffect(() => {
    setSortedTables(tables);
  }, [tables]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  const locationGroups = useMemo(() => {
    return sortedTables.reduce((groups, table) => {
      const location = table.location || 'No Location';
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(table);
      return groups;
    }, {} as Record<string, DisplayTable[]>);
  }, [sortedTables]);

  return (
    <div className="relative">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div className="space-y-8">
          {Object.entries(locationGroups).map(([location, locationTables]) => (
            <div key={location} className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <h3 className="text-lg font-semibold text-gray-800">{location}</h3>
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500">
                  {locationTables.length} tables
                </span>
              </div>
              <SortableContext
                items={locationTables.map((t) => t.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {locationTables.map((table) => (
                    <DraggableTableCard
                      key={table.id}
                      table={table}
                      onEditReservation={onEditReservation}
                      onCreateReservation={onCreateReservation}
                      onUnmerge={onUnmerge}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
