export interface Table {
  id: number;
  name: string;
  capacity: number;
  location?: string;
  status: 'available' | 'maintenance' | 'reserved';
  created_at: string;
  updated_at: string;
}

export interface CreateTableData {
  name: string;
  capacity: number;
  location?: string;
  status: 'available' | 'maintenance' | 'reserved';
}

export interface UpdateTableData {
  name?: string;
  capacity?: number;
  location?: string;
  status?: 'available' | 'maintenance' | 'reserved';
}

export interface TempTable {
  name: string;
  capacity: number;
  location?: string;
  status: 'available' | 'maintenance' | 'reserved';
}

export interface OnboardingData {
  tableCount: number;
  tables: TempTable[];
}

// Reservation related types
export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  customer_id: number;
  table_id: number;
  reservation_date: string; // ISO date string
  reservation_time: string; // Time string (HH:MM format)
  party_size: number;
  status: 'pending' | 'confirmed' | 'discarded' | 'completed' | 'no_show';
  special_requests?: string;
  reminder_sent: boolean;
  telegram_message_id?: number;
  confirmed_by?: number;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  table?: Table;
}

export interface CreateReservationData {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  special_requests?: string;
}

export interface ReservationResponse {
  success: boolean;
  message: string;
  reservation?: Reservation;
  error?: string;
}
