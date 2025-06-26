'use client';

import { useTranslations } from 'next-intl';
import { DashboardTable } from '@/lib/types';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';
import { ReservationInfoPopover } from './reservation-info-popover';
import { NewReservationPopover } from './new-reservation-popover';

interface TableCardProps {
  table: DashboardTable;
  onEditReservation?: (table: DashboardTable) => void;
  onDeleteReservation?: (table: DashboardTable) => void;
  onCreateReservation?: (reservationData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    party_size: number;
    reservation_time: string;
    special_requests: string;
    table_id: string;
    reservation_date: string;
  }) => void;
}

export function TableCard({ table, onEditReservation, onDeleteReservation, onCreateReservation }: TableCardProps) {
  const t = useTranslations('Dashboard');

  const getStatusColors = (status: DashboardTable['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'confirmed':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const TableCardContent = (
    <div
      className={cn(
        'aspect-square rounded-lg border-2 p-3 cursor-pointer transition-all hover:shadow-md relative group',
        getStatusColors(table.status),
        'hover:scale-105'
      )}
    >
      {/* Drag handle indicator */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-60 transition-opacity">
        <GripVertical className="h-3 w-3" />
      </div>
      
      <div className="flex flex-col h-full">
        <div className="font-semibold text-sm truncate">{table.name}</div>
        <div className="text-xs opacity-75 mt-1">
          {table.capacity} {t('guests')}
        </div>
        {table.location && (
          <div className="text-xs opacity-60 truncate">{table.location}</div>
        )}
        
        <div className="flex-1" />
        
        {table.reservation ? (
          <div className="text-xs space-y-1">
            <div className="font-medium truncate">
              {table.reservation.customer_name}
            </div>
            <div className="opacity-75">
              {t('at')} {table.reservation.reservation_time}
            </div>
            <div className="opacity-60">
              {table.reservation.party_size} {t('guests')}
            </div>
          </div>
        ) : (
          <div className="text-xs opacity-75">
            {t('noReservations')}
          </div>
        )}
      </div>
    </div>
  );

  // Wrap with appropriate popover based on reservation status
  if (table.reservation) {
    return (
      <ReservationInfoPopover
        table={table}
        onEdit={onEditReservation}
        onDelete={onDeleteReservation}
      >
        {TableCardContent}
      </ReservationInfoPopover>
    );
  } else {
    return (
      <NewReservationPopover
        table={table}
        onCreateReservation={onCreateReservation}
      >
        {TableCardContent}
      </NewReservationPopover>
    );
  }
}
