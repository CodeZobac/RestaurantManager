export interface RevenueData {
  date: string;
  total_reservations: number;
  completed_reservations: number;
  total_guests_served: number;
  avg_party_size: number;
  estimated_revenue: number;
  restaurant_id: string;
}

export interface CustomerInsight {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  total_reservations: number;
  completed_visits: number;
  no_shows: number;
  completion_rate: number;
  first_visit: string;
  last_visit: string;
  avg_party_size: number;
  customer_type: 'New Customer' | 'Regular Customer' | 'VIP Customer';
  restaurant_id: string;
}

export interface OccupancyData {
  date: string;
  hour: number;
  tables_occupied: number;
  total_tables: number;
  occupancy_rate: number;
  total_guests: number;
  total_capacity: number;
  capacity_utilization: number;
  restaurant_id: string;
}

export interface DailyPerformanceData {
  date: string;
  total_reservations: number;
  confirmed_reservations: number;
  completed_reservations: number;
  cancelled_reservations: number;
  no_shows: number;
  total_guests_reserved: number;
  total_guests_served: number;
  avg_party_size: number;
  completion_rate: number;
  no_show_rate: number;
  restaurant_id: string;
}

export interface PeakHoursData {
  hour: number;
  reservation_count: number;
  completed_count: number;
  avg_party_size: number;
  total_guests: number;
  table_utilization_rate: number;
  restaurant_id: string;
}

export interface TableUtilizationData {
  id: number;
  name: string;
  capacity: number;
  total_reservations: number;
  confirmed_reservations: number;
  confirmation_rate: number;
}

export interface AnalyticsData {
  revenue: RevenueData[];
  customers: CustomerInsight[];
  occupancy: OccupancyData[];
  dailyPerformance: DailyPerformanceData[];
  peakHours: PeakHoursData[];
  tableUtilization: TableUtilizationData[];
}

export interface DateRange {
  from: Date;
  to?: Date;
}
