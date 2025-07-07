'use client';

import { useTranslations } from 'next-intl';
import { DisplayTable, DashboardTable, TableGroup } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';
import { ReservationInfoPopover } from './reservation-info-popover';

interface TableCardProps {
  table: DisplayTable;
  onEditReservation?: (table: DashboardTable) => void;
  onDeleteReservation?: (reservationId: string) => void;
  onAcceptReservation?: (reservationId: string) => void;
  onDeclineReservation?: (reservationId: string) => void;
  onCreateReservation?: (table: DashboardTable) => void;
  onUnmerge?: (groupId: string) => void;
}

export function TableCard({ 
  table, 
  onEditReservation, 
  onDeleteReservation, 
  onAcceptReservation, 
  onDeclineReservation, 
  onCreateReservation, 
  onUnmerge 
}: TableCardProps) {
  const t = useTranslations('Dashboard');

  const isGroup = 'isGroup' in table;

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
        'rounded-lg border-2 p-3 cursor-pointer transition-all hover:shadow-md relative group',
        'sm:aspect-square',
        getStatusColors(table.status),
        'hover:scale-105'
      )}
    >
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-60 transition-opacity">
        <GripVertical className="h-3 w-3" />
      </div>
      
      <div className="flex flex-col sm:flex-col h-full">
        <div className="flex flex-row sm:flex-col">
          <div className="flex-1">
            <div className="font-semibold text-sm truncate">{table.name}</div>
            <div className="text-xs opacity-75 mt-1">
              {table.capacity} {t('guests')}
            </div>
            {table.location && (
              <div className="text-xs opacity-60 truncate">{table.location}</div>
            )}
          </div>
          
          <div className="flex-1 sm:hidden" />

          {!isGroup && (table as DashboardTable).reservation ? (
            <div className="text-xs space-y-1 text-right sm:text-left">
              <div className="font-medium truncate">
                {(table as DashboardTable).reservation!.customer_name}
              </div>
              <div className="opacity-75">
                {t('at')} {(table as DashboardTable).reservation!.reservation_time}
              </div>
              <div className="opacity-60">
                {(table as DashboardTable).reservation!.party_size} {t('guests')}
              </div>
            </div>
          ) : !isGroup ? (
            <div className="text-xs opacity-75 text-right sm:text-left">
              {t('noReservations')}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (isGroup) {
    const group = table as TableGroup;
    return (
      <div
        className={cn(
          'aspect-square rounded-lg border-2 p-3 transition-all hover:shadow-md relative group',
          'bg-blue-100 border-blue-300 text-blue-800',
          'hover:scale-105'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="font-semibold text-sm truncate">{group.name}</div>
          <div className="text-xs opacity-75 mt-1">
            {group.capacity} {t('guests')}
          </div>
          <div className="flex-1" />
          <Button
            onClick={() => onUnmerge?.(group.id)}
            size="sm"
            variant="outline"
            className="w-full"
          >
            {t('split')}
          </Button>
        </div>
      </div>
    );
  }

  const dashboardTable = table as DashboardTable;

  if (dashboardTable.reservation) {
    return (
      <ReservationInfoPopover
        table={dashboardTable}
        onEdit={() => onEditReservation?.(dashboardTable)}
        onDelete={onDeleteReservation}
        onAccept={onAcceptReservation}
        onDecline={onDeclineReservation}
      >
        {TableCardContent}
      </ReservationInfoPopover>
    );
  } else {
    return (
      <div onClick={() => onCreateReservation?.(dashboardTable)}>
        {TableCardContent}
      </div>
    );
  }
}
