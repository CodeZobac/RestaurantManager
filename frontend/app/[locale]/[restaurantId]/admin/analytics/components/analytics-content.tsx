'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from './date-picker-range';
import { KPICards } from './kpi-cards';
import { RevenueChart } from './revenue-chart';
import { PeakHoursChart } from './peak-hours-chart';
import { ReservationStatusChart } from './reservation-status-chart';
import { TableUtilizationTable } from './table-utilization-table';
import { CustomerInsightsTable } from './customer-insights-table';
import { LoadingSpinner } from './loading-spinner';
import { CalendarIcon, BarChart3, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { AnalyticsData } from '../types/analytics';
import { DateRange } from 'react-day-picker';

interface AnalyticsContentProps {
  restaurantId: string;
  initialDateRange: DateRange;
}

export function AnalyticsContent({ restaurantId, initialDateRange }: AnalyticsContentProps) {
  const t = useTranslations('Analytics');
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);

  const handleDateChange = (date: DateRange | undefined) => {
    if (date) {
      setDateRange(date);
    }
  };
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = React.useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return;
    
    setLoading(true);
    setError(null);

    try {
      const analyticsTypes = [
        'revenue',
        'customers', 
        'occupancy',
        'daily_performance',
        'peak_hours',
        'table_utilization'
      ];

      const promises = analyticsTypes.map(type => 
        fetch(`/api/analytics?restaurantId=${restaurantId}&type=${type}&startDate=${format(dateRange.from!, 'yyyy-MM-dd')}&endDate=${format(dateRange.to!, 'yyyy-MM-dd')}`)
          .then(res => res.json())
          .then(result => ({ type, data: result.data || [] }))
      );

      const results = await Promise.all(promises);
      
      const analyticsData: AnalyticsData = {
        revenue: [],
        customers: [],
        occupancy: [],
        dailyPerformance: [],
        peakHours: [],
        tableUtilization: []
      };

      results.forEach(result => {
        switch (result.type) {
          case 'revenue':
            analyticsData.revenue = result.data;
            break;
          case 'customers':
            analyticsData.customers = result.data;
            break;
          case 'occupancy':
            analyticsData.occupancy = result.data;
            break;
          case 'daily_performance':
            analyticsData.dailyPerformance = result.data;
            break;
          case 'peak_hours':
            analyticsData.peakHours = result.data;
            break;
          case 'table_utilization':
            analyticsData.tableUtilization = result.data;
            break;
        }
      });

      setData(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(t('failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [restaurantId, dateRange, t]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);


  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <p className="text-red-600 mb-2">{error}</p>
              <button 
                onClick={fetchAnalyticsData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('retry')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            {t('dashboardTitle')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('dashboardDescription')}
          </p>
        </div>
        
        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-500" />
          <DatePickerWithRange
            date={dateRange as DateRange | undefined}
            onDateChange={handleDateChange}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards data={data} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              {t('revenueTrendsTitle')}
            </CardTitle>
            <CardDescription>
              {t('revenueTrendsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data?.revenue || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              {t('peakHoursTitle')}
            </CardTitle>
            <CardDescription>
              {t('peakHoursDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PeakHoursChart data={data?.peakHours || []} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              {t('reservationStatusTitle')}
            </CardTitle>
            <CardDescription>
              {t('reservationStatusDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReservationStatusChart data={data?.dailyPerformance || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('tableUtilizationTitle')}</CardTitle>
            <CardDescription>
              {t('tableUtilizationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableUtilizationTable data={data?.tableUtilization || []} />
          </CardContent>
        </Card>
      </div>

      {/* Customer Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            {t('customerInsightsTitle')}
          </CardTitle>
          <CardDescription>
            {t('customerInsightsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerInsightsTable data={data?.customers || []} />
        </CardContent>
      </Card>
    </div>
  );
}
