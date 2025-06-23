import { Table, CreateTableData, UpdateTableData, TempTable } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const tableApi = {
  // Get all tables
  getTables: (): Promise<Table[]> => {
    return fetchApi<Table[]>('/tables');
  },

  // Create a single table
  createTable: (data: CreateTableData): Promise<Table> => {
    return fetchApi<Table>('/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Create multiple tables (for onboarding)
  createTablesBulk: (tables: TempTable[]): Promise<Table[]> => {
    return fetchApi<Table[]>('/tables/bulk', {
      method: 'POST',
      body: JSON.stringify({ tables }),
    });
  },

  // Update a table
  updateTable: (id: number, data: UpdateTableData): Promise<Table> => {
    return fetchApi<Table>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a table
  deleteTable: (id: number): Promise<void> => {
    return fetchApi<void>(`/tables/${id}`, {
      method: 'DELETE',
    });
  },

  // Check onboarding status
  getOnboardingStatus: (): Promise<{ completed: boolean }> => {
    return fetchApi<{ completed: boolean }>('/onboarding/status');
  },

  // Mark onboarding as complete
  completeOnboarding: (): Promise<void> => {
    return fetchApi<void>('/onboarding/complete', {
      method: 'POST',
    });
  },
};

export { ApiError };
