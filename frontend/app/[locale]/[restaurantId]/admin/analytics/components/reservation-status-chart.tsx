'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { DailyPerformanceData } from '../types/analytics';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ReservationStatusChartProps {
  data: DailyPerformanceData[];
}

export function ReservationStatusChart({ data }: ReservationStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No reservation status data available
      </div>
    );
  }

  // Aggregate data across all days
  const totals = data.reduce(
    (acc, item) => ({
      confirmed: acc.confirmed + (item.confirmed_reservations || 0),
      completed: acc.completed + (item.completed_reservations || 0),
      cancelled: acc.cancelled + (item.cancelled_reservations || 0),
      noShows: acc.noShows + (item.no_shows || 0),
    }),
    { confirmed: 0, completed: 0, cancelled: 0, noShows: 0 }
  );

  const chartData = {
    labels: ['Completed', 'Confirmed', 'No Shows', 'Cancelled'],
    datasets: [
      {
        data: [totals.completed, totals.confirmed, totals.noShows, totals.cancelled],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Completed - Green
          'rgba(59, 130, 246, 0.8)',  // Confirmed - Blue
          'rgba(239, 68, 68, 0.8)',   // No Shows - Red
          'rgba(156, 163, 175, 0.8)', // Cancelled - Gray
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(34, 197, 94, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(239, 68, 68, 0.9)',
          'rgba(156, 163, 175, 0.9)',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: { label: string; parsed: number; dataset: { data: number[] } }) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '50%',
  };

  const total = totals.completed + totals.confirmed + totals.noShows + totals.cancelled;

  return (
    <div className="space-y-4">
      <div className="h-48 w-full relative">
        <Doughnut data={chartData} options={options} />
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>
      </div>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
          <span className="text-green-700">Completion Rate:</span>
          <span className="font-semibold text-green-800">
            {total > 0 ? ((totals.completed / total) * 100).toFixed(1) : 0}%
          </span>
        </div>
        <div className="flex items-center justify-between p-2 bg-red-50 rounded">
          <span className="text-red-700">No-Show Rate:</span>
          <span className="font-semibold text-red-800">
            {total > 0 ? ((totals.noShows / total) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
