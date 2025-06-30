export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  password?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  restaurant_id?: string;
}

export interface DashboardTable {
  id: string;
  name: string;
  status: 'available' | 'pending' | 'confirmed';
  capacity: number;
  location?: string;
  connections?: string[];
  reservation?: {
    id: string;
    customer_name: string;
    reservation_time: string;
    party_size: number;
    customer_email?: string;
    customer_phone?: string;
  };
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  location?: string;
  status: 'available' | 'maintenance' | 'pending' | 'confirmed' | 'occupied';
  reservation?: {
    customer_name: string;
    reservation_time: string;
    party_size: number;
    customer_email?: string;
    customer_phone?: string;
  }; // Optional reservation data for enhanced table management
}

export interface Restaurant {
  id: string;
  name: string;
  location?: string;
}

export type CreateTableData = Omit<Table, 'id'>;
export type UpdateTableData = Partial<CreateTableData>;
export type TempTable = Omit<Table, 'id'>;

export interface CreateReservationData {
  restaurant_id: string;
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
  message?: string;
  error?: string;
  reservation?: Table;
}

export interface DashboardStatusResponse {
  totalTables: number;
  available: number;
  occupied: number;
  pending: number;
  tables: DashboardTable[];
}

// New Type for Merged Groups
export interface TableGroup {
  id: string; // e.g., "group-table1-table2"
  isGroup: true;
  name: string; // e.g., "Table 1 + Table 2"
  capacity: number; // Sum of capacities
  status: 'available'; // Groups are always available
  tables: DashboardTable[]; // The original tables in the group
  location?: string;
}

// A union type to represent either a single table or a group
export type DisplayTable = DashboardTable | TableGroup;
