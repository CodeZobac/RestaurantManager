'use client';

import { Badge } from '@/components/ui/badge';

interface TableStatusBadgeProps {
  status: 'available' | 'maintenance' | 'pending' | 'confirmed' | 'occupied';
}

export function TableStatusBadge({ status }: TableStatusBadgeProps) {

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'; // Green - no reservations
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Yellow - pending reservations
      case 'confirmed':
        return 'bg-red-100 text-red-800 border-red-200'; // Red - confirmed reservations
      case 'maintenance':
        return 'bg-gray-100 text-gray-800 border-gray-200'; // Gray - maintenance
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-200'; // Red - occupied (legacy)
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'maintenance':
        return 'Maintenance';
      case 'occupied':
        return 'Occupied';
      default:
        return status;
    }
  };

  return (
    <Badge className={`border ${getStatusStyle(status)}`}>
      {getStatusText(status)}
    </Badge>
  );
}
