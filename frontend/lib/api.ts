import {
  Table,
  CreateTableData,
  UpdateTableData,
  TempTable,
  CreateReservationData,
  ReservationResponse,
  DashboardStatusResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
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
    return fetchApi<Table[]>("/api/v1/tables/");
  },

  // Create a single table
  createTable: (data: CreateTableData): Promise<Table> => {
    return fetchApi<Table>("/api/v1/tables/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Create multiple tables (for onboarding)
  createTablesBulk: (tables: TempTable[]): Promise<Table[]> => {
    return fetchApi<Table[]>("/api/v1/tables/bulk/", {
      method: "POST",
      body: JSON.stringify({ tables }),
    });
  },

  // Update a table
  updateTable: (id: number, data: UpdateTableData): Promise<Table> => {
    return fetchApi<Table>(`/api/v1/tables/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete a table
  deleteTable: (id: number): Promise<void> => {
    return fetchApi<void>(`/api/v1/tables/${id}/`, {
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
    const raw = await fetchApi<any>(`/api/v1/dashboard-status?date=${date}`);
    console.log("DASHBOARD RAW RESPONSE:", raw);
    // Map backend response to expected DashboardStatusResponse
    return {
      date: raw.date,
      tables: (raw.tables ?? []).map((table: any) => ({
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
        reservation: table.reservation
          ? {
              id: table.reservation.id,
              customer_name: table.reservation.customer_name ?? "",
              reservation_time: table.reservation.reservation_time,
              party_size: table.reservation.party_size,
            }
          : undefined,
      })),
    };
  },
};

export { ApiError };
