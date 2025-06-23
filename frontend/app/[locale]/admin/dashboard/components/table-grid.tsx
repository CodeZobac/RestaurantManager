'use client';

import { DashboardTable } from '@/lib/types';
import { TableCard } from './table-card';

interface TableGridProps {
  tables: DashboardTable[];
  onTableClick?: (table: DashboardTable) => void;
}

export function TableGrid({ tables, onTableClick }: TableGridProps) {
  if (tables.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No tables found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onClick={onTableClick ? () => onTableClick(table) : undefined}
        />
      ))}
    </div>
  );
}
