'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { dashboardApi, ApiError } from '@/lib/api';
import { DashboardTable } from '@/lib/types';
import { DashboardHeader } from './dashboard-header';
import { TableGrid } from './table-grid';
import { Button } from '@/components/ui/button';

export function DashboardContent() {
  const t = useTranslations('Dashboard');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tables, setTables] = useState<DashboardTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const response = await dashboardApi.getDashboardStatus(dateString);
      setTables(response.tables);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t('error'));
      }
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDashboardData(selectedDate);
  }, [selectedDate, fetchDashboardData]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTableClick = (table: DashboardTable) => {
    // TODO: Handle table click - could show reservation details, etc.
    console.log('Table clicked:', table);
  };

  const handleRetry = () => {
    fetchDashboardData(selectedDate);
  };

  // Debug: log tables before reduce
  console.log("DASHBOARD DEBUG: tables =", tables);

  // Count tables by status
  const statusCounts = (tables ?? []).reduce(
    (acc, table) => {
      acc[table.status] = (acc[table.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <DashboardHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-800 font-semibold">{t('availableTables')}</div>
          <div className="text-2xl font-bold text-green-900">
            {statusCounts.available || 0}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800 font-semibold">{t('pendingReservations')}</div>
          <div className="text-2xl font-bold text-yellow-900">
            {statusCounts.pending || 0}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-semibold">{t('confirmedReservations')}</div>
          <div className="text-2xl font-bold text-red-900">
            {statusCounts.confirmed || 0}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('loading')}</div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-600">{error}</div>
          <Button onClick={handleRetry} variant="outline">
            {t('retry')}
          </Button>
        </div>
      ) : (
        <TableGrid tables={tables ?? []} onTableClick={handleTableClick} />
      )}
    </div>
  );
}
