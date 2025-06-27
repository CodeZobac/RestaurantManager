'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Clock } from 'lucide-react';
import { AnalyticsData } from '../types/analytics';

interface KPICardsProps {
  data: AnalyticsData | null;
}

export function KPICards({ data }: KPICardsProps) {
  const t = useTranslations('Analytics.kpi');
  if (!data) return null;

  // Calculate KPIs from the data
  const totalRevenue = data.revenue.reduce((sum, item) => sum + (item.estimated_revenue || 0), 0);
  const totalReservations = data.dailyPerformance.reduce((sum, item) => sum + (item.total_reservations || 0), 0);
  const completedReservations = data.dailyPerformance.reduce((sum, item) => sum + (item.completed_reservations || 0), 0);
  const totalGuests = data.dailyPerformance.reduce((sum, item) => sum + (item.total_guests_served || 0), 0);
  
  const completionRate = totalReservations > 0 ? (completedReservations / totalReservations) * 100 : 0;
  const avgRevenuePerDay = data.revenue.length > 0 ? totalRevenue / data.revenue.length : 0;
  const avgGuestsPerReservation = completedReservations > 0 ? totalGuests / completedReservations : 0;

  // Get peak hour
  const peakHour = data.peakHours.reduce((max, hour) => 
    hour.reservation_count > (max.reservation_count || 0) ? hour : max, 
    { hour: 0, reservation_count: 0 }
  );

  const kpis = [
    {
      title: t('totalRevenue'),
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: totalRevenue > 0 ? 'up' : 'neutral',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: t('totalReservations'),
      value: totalReservations.toLocaleString(),
      icon: Calendar,
      trend: totalReservations > 0 ? 'up' : 'neutral',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: t('completionRate'),
      value: `${completionRate.toFixed(1)}%`,
      icon: Users,
      trend: completionRate > 75 ? 'up' : completionRate > 50 ? 'neutral' : 'down',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: t('avgGuestsPerReservation'),
      value: avgGuestsPerReservation.toFixed(1),
      icon: Users,
      trend: avgGuestsPerReservation > 3 ? 'up' : 'neutral',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: t('avgRevenuePerDay'),
      value: `$${avgRevenuePerDay.toLocaleString()}`,
      icon: TrendingUp,
      trend: avgRevenuePerDay > 0 ? 'up' : 'neutral',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: t('peakHour'),
      value: `${peakHour.hour}:00`,
      icon: Clock,
      trend: 'neutral',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : null;
        
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {kpi.value}
                </div>
                {TrendIcon && (
                  <TrendIcon 
                    className={`h-4 w-4 ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`} 
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
