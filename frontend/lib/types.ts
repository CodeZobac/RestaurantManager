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
