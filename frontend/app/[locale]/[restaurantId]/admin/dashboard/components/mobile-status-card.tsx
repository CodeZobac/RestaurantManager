'use client';

import { useTranslations } from 'next-intl';

export type ReservationStatus = 'available' | 'pending' | 'confirmed';

interface MobileStatusCardProps {
  statusCounts: Record<string, number>;
  onFilterChange: (status: ReservationStatus | null) => void;
  selectedStatus: ReservationStatus | null;
}

export function MobileStatusCard({
  statusCounts,
  onFilterChange,
  selectedStatus,
}: MobileStatusCardProps) {
  const t = useTranslations('Dashboard');

  const statuses: ReservationStatus[] = ['available', 'pending', 'confirmed'];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:hidden">
      <div className="flex justify-around">
        {statuses.map((status) => (
          <div
            key={status}
            className={`text-center cursor-pointer p-2 rounded-lg ${
              selectedStatus === status ? 'bg-gray-200' : ''
            }`}
            onClick={() => onFilterChange(selectedStatus === status ? null : status)}
          >
            <div
              className={`font-semibold ${
                status === 'available'
                  ? 'text-green-800'
                  : status === 'pending'
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}
            >
              {t(
                status === 'available'
                  ? 'availableTables'
                  : status === 'pending'
                  ? 'pendingReservations'
                  : 'confirmedReservations'
              )}
            </div>
            <div
              className={`text-2xl font-bold ${
                status === 'available'
                  ? 'text-green-900'
                  : status === 'pending'
                  ? 'text-yellow-900'
                  : 'text-red-900'
              }`}
            >
              {statusCounts[status] || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
