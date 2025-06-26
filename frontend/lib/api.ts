import {
  Table,
  CreateTableData,
  UpdateTableData,
  TempTable,
  CreateReservationData,
  ReservationResponse,
  DashboardStatusResponse,
  Restaurant,
} from "./types";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Use internal Next.js API routes
  const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: 'include', // Include cookies for session
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || response.statusText;
    } catch {
      errorMessage = errorText || response.statusText;
    }
    throw new ApiError(response.status, errorMessage);
  }

  return response.json();
}

export const tableApi = {
  // Get all tables
  getTables: (restaurantId?: string): Promise<Table[]> => {
    const endpoint = restaurantId ? `/api/tables?restaurantId=${restaurantId}` : "/api/tables";
    return fetchApi<Table[]>(endpoint);
  },

  // Create a single table
  createTable: (data: CreateTableData): Promise<Table> => {
    return fetchApi<Table>("/api/tables", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Create multiple tables (for onboarding)
  createTablesBulk: async (tables: TempTable[]): Promise<Table[]> => {
    const createdTables: Table[] = [];
    for (const table of tables) {
      const createdTable = await fetchApi<Table>("/api/tables", {
        method: "POST",
        body: JSON.stringify(table),
      });
      createdTables.push(createdTable);
    }
    return createdTables;
  },

  // Update a table
  updateTable: (id: number, data: UpdateTableData): Promise<Table> => {
    return fetchApi<Table>(`/api/tables/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete a table
  deleteTable: (id: number): Promise<void> => {
    return fetchApi<void>(`/api/tables/${id}`, {
      method: "DELETE",
    });
  },

  // Check onboarding status
  getOnboardingStatus: (): Promise<{ completed: boolean }> => {
    return fetchApi<{ completed: boolean }>("/onboarding/status");
  },

  // Mark onboarding as complete
  completeOnboarding: (): Promise<void> => {
    return fetchApi<void>("/onboarding/complete", {
      method: "POST",
    });
  },
};

export const reservationApi = {
  // Create a new reservation
  createReservation: (
    data: CreateReservationData
  ): Promise<ReservationResponse> => {
    return fetchApi<ReservationResponse>("/reservations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export const dashboardApi = {
  // Get dashboard status for a specific date
  getDashboardStatus: async (
    date: string
  ): Promise<DashboardStatusResponse> => {
    const response = await fetchApi<DashboardStatusResponse>(`/api/dashboard-status?date=${date}`);
    return response;
  },
};

export const restaurantApi = {
  // Get all restaurants
  getRestaurants: (): Promise<Restaurant[]> => {
    return fetchApi<Restaurant[]>("/api/restaurants");
  },
};

export { ApiError };
