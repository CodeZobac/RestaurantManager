'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { dashboardApi, adminApi, ApiError } from '@/lib/api';
import { CreateReservationData, DashboardTable, DisplayTable, TableGroup, Admin } from '@/lib/types';
import { DashboardHeader } from './dashboard-header';
import { TableGrid } from './table-grid';
import { Button } from '@/components/ui/button';
import { MobileStatusCard, ReservationStatus } from './mobile-status-card';
import { ReservationModal, ReservationFormData } from './reservation-modal';

interface DashboardContentProps {
  restaurantId: string;
}

export function DashboardContent({ restaurantId }: DashboardContentProps) {
  const t = useTranslations('Dashboard');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tables, setTables] = useState<DisplayTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<DashboardTable | null>(null);
  const [modalInitialData, setModalInitialData] = useState<
    ReservationFormData | undefined
  >(undefined);
  const [admin, setAdmin] = useState<Admin | null>(null);

  const fetchDashboardData = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const response = await dashboardApi.getDashboardStatus(dateString);
      
      const sortedTables = response.tables.sort((a: DashboardTable, b: DashboardTable) => {
        const locationA = a.location || '';
        const locationB = b.location || '';
        return locationA.localeCompare(locationB);
      });
      
      setTables(sortedTables);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403 && err.message.includes('No restaurant associated')) {
          const locale = window.location.pathname.split('/')[1];
          window.location.href = `/${locale}/onboarding`;
          return;
        }
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

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const adminData = await adminApi.getAdmin();
        setAdmin(adminData);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      }
    };
    fetchAdmin();
  }, []);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleFilterChange = (status: ReservationStatus | null) => {
    setFilterStatus(status);
  };

  const handleOpenModal = (
    table: DashboardTable,
    initialData?: ReservationFormData
  ) => {
    setSelectedTable(table);
    setModalInitialData(initialData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
    setModalInitialData(undefined);
  };

  const handleEditReservation = (table: DashboardTable) => {
    handleOpenModal(table, {
      customer_name: table.reservation?.customer_name || '',
      customer_email: table.reservation?.customer_email || '',
      customer_phone: table.reservation?.customer_phone || '',
      party_size: table.reservation?.party_size || 1,
      reservation_time: table.reservation?.reservation_time || '',
      special_requests: '',
    });
  };

  const handleCreateReservation = async (table: DashboardTable) => {
    handleOpenModal(table);
  };

  const handleDeleteReservation = async (reservationId: string) => {
    try {
      await dashboardApi.deleteReservation(reservationId);
      fetchDashboardData(selectedDate);
    } catch (error) {
      console.error('Failed to delete reservation', error);
      setError(t('errorDelete'));
    }
  };

  const handleAcceptReservation = async (reservationId: string) => {
    try {
      await dashboardApi.updateReservation(reservationId, { status: 'confirmed' });
      fetchDashboardData(selectedDate);
    } catch (error) {
      console.error('Failed to accept reservation', error);
      setError(t('errorAccept'));
    }
  };

  const handleDeclineReservation = async (reservationId: string) => {
    try {
      await dashboardApi.updateReservation(reservationId, { status: 'declined' });
      fetchDashboardData(selectedDate);
    } catch (error) {
      console.error('Failed to decline reservation', error);
      setError(t('errorDecline'));
    }
  };

  const handleModalSubmit = async (
    reservationData: Omit<CreateReservationData, 'restaurant_id' | 'reservation_date'>
  ) => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reservationData,
          restaurant_id: restaurantId,
          reservation_date: format(selectedDate, 'yyyy-MM-dd'),
        }),
      });

      if (response.ok) {
        fetchDashboardData(selectedDate);
      } else {
        console.error('Failed to create reservation');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  const handleRetry = () => {
    fetchDashboardData(selectedDate);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    setTables((currentTables) => {
      const activeItem = currentTables.find((t) => t.id === activeId);
      const overItem = currentTables.find((t) => t.id === overId);

      if (activeItem && overItem && activeId !== overId && !('isGroup' in activeItem) && !('isGroup' in overItem)) {
        const activeTable = activeItem as DashboardTable;
        const overTable = overItem as DashboardTable;

        const newGroup: TableGroup = {
          id: `group-${activeTable.id}-${overTable.id}`,
          isGroup: true,
          name: `${activeTable.name} + ${overTable.name}`,
          capacity: activeTable.capacity + overTable.capacity,
          status: 'available',
          tables: [activeTable, overTable],
          location: activeTable.location,
        };

        return [
          ...currentTables.filter((t) => t.id !== activeId && t.id !== overId),
          newGroup,
        ];
      }

      const oldIndex = currentTables.findIndex((item) => item.id === activeId);
      const newIndex = currentTables.findIndex((item) => item.id === overId);
      return arrayMove(currentTables, oldIndex, newIndex);
    });
  };

  const handleUnmerge = (groupId: string) => {
    setTables((currentTables) => {
      const groupToUnmerge = currentTables.find((t) => t.id === groupId) as TableGroup;
      if (!groupToUnmerge || !groupToUnmerge.isGroup) return currentTables;

      return [
        ...currentTables.filter((t) => t.id !== groupId),
        ...groupToUnmerge.tables,
      ];
    });
  };

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
        admin={admin}
      />

      <MobileStatusCard
        statusCounts={statusCounts}
        onFilterChange={handleFilterChange}
        selectedStatus={filterStatus}
      />
      <div className="hidden sm:grid sm:grid-cols-3 gap-4 mb-6">
        <div
          className={`bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer ${
            filterStatus === 'available' ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() => handleFilterChange(filterStatus === 'available' ? null : 'available')}
        >
          <div className="text-green-800 font-semibold">{t('availableTables')}</div>
          <div className="text-2xl font-bold text-green-900">
            {statusCounts.available || 0}
          </div>
        </div>
        <div
          className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer ${
            filterStatus === 'pending' ? 'ring-2 ring-yellow-500' : ''
          }`}
          onClick={() => handleFilterChange(filterStatus === 'pending' ? null : 'pending')}
        >
          <div className="text-yellow-800 font-semibold">{t('pendingReservations')}</div>
          <div className="text-2xl font-bold text-yellow-900">
            {statusCounts.pending || 0}
          </div>
        </div>
        <div
          className={`bg-red-50 border border-red-200 rounded-lg p-4 cursor-pointer ${
            filterStatus === 'confirmed' ? 'ring-2 ring-red-500' : ''
          }`}
          onClick={() => handleFilterChange(filterStatus === 'confirmed' ? null : 'confirmed')}
        >
          <div className="text-red-800 font-semibold">{t('confirmedReservations')}</div>
          <div className="text-2xl font-bold text-red-900">
            {statusCounts.confirmed || 0}
          </div>
        </div>
      </div>

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
        <>
          {filterStatus &&
          tables.filter((table) => table.status === filterStatus).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">
                {t('noTablesForFilter')}
              </p>
            </div>
          ) : (
            <TableGrid
              tables={
                filterStatus
                  ? tables.filter((table) => table.status === filterStatus)
                  : tables ?? []
              }
              onEditReservation={handleEditReservation}
              onDeleteReservation={handleDeleteReservation}
              onAcceptReservation={handleAcceptReservation}
              onDeclineReservation={handleDeclineReservation}
              onCreateReservation={handleCreateReservation}
              onDragEnd={handleDragEnd}
              onUnmerge={handleUnmerge}
            />
          )}
        </>
      )}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        table={selectedTable}
        onSubmit={handleModalSubmit}
        initialData={modalInitialData}
      />
    </div>
  );
}
