import { create } from 'zustand';
import { Table, CreateTableData, UpdateTableData, TempTable } from './types';
import { tableApi, ApiError } from './api';

interface TableStore {
  // State
  tables: Table[];
  loading: boolean;
  error: string | null;
  selectedTable: Table | null;

  // Actions
  fetchTables: (restaurantId: string) => Promise<void>;
  createTable: (data: CreateTableData) => Promise<void>;
  createTablesBulk: (tables: TempTable[]) => Promise<void>;
  updateTable: (id: number, data: UpdateTableData) => Promise<void>;
  updateBulkTables: (tableIds: string[], data: Partial<UpdateTableData>) => Promise<void>;
  deleteTable: (id: number) => Promise<void>;
  setSelectedTable: (table: Table | null) => void;
  clearError: () => void;
}

interface OnboardingStore {
  // State
  step: number;
  tableCount: number;
  tempTables: TempTable[];
  isCompleted: boolean;
  loading: boolean;

  // Actions
  setStep: (step: number) => void;
  setTableCount: (count: number) => void;
  generateTables: (count: number, namePrefix: string, defaultLocation: string) => void;
  updateTempTable: (index: number, data: Partial<TempTable>) => void;
  completeOnboarding: (tableStore: TableStore) => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
  reset: () => void;
}

export const useTableStore = create<TableStore>((set) => ({
  // Initial state
  tables: [],
  loading: false,
  error: null,
  selectedTable: null,

  // Actions
  fetchTables: async (restaurantId: string) => {
    set({ loading: true, error: null });
    try {
      const tables = await tableApi.getTables(restaurantId);
      set({ tables, loading: false });
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to fetch tables';
      set({ error: errorMessage, loading: false });
    }
  },

  createTable: async (data: CreateTableData) => {
    set({ loading: true, error: null });
    try {
      const newTable = await tableApi.createTable(data);
      set(state => ({
        tables: [...state.tables, newTable],
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to create table';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createTablesBulk: async (tables: TempTable[]) => {
    set({ loading: true, error: null });
    try {
      const newTables = await tableApi.createTablesBulk(tables);
      set(state => ({
        tables: [...state.tables, ...newTables],
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to create tables';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateTable: async (id: number, data: UpdateTableData) => {
    set({ loading: true, error: null });
    try {
      const updatedTable = await tableApi.updateTable(id, data);
      set(state => ({
        tables: state.tables.map(table =>
          parseInt(table.id, 10) === id ? updatedTable : table
        ),
        loading: false,
        selectedTable: state.selectedTable?.id === id.toString() ? updatedTable : state.selectedTable
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to update table';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateBulkTables: async (tableIds: string[], data: Partial<UpdateTableData>) => {
    set({ loading: true, error: null });
    try {
      // Update each table individually for now
      // In a real implementation, you'd want a bulk API endpoint
      const updatePromises = tableIds.map(async (tableId) => {
        const numericId = parseInt(tableId, 10);
        return await tableApi.updateTable(numericId, data as UpdateTableData);
      });
      
      const updatedTables = await Promise.all(updatePromises);
      
      set(state => ({
        tables: state.tables.map(table => {
          const updatedTable = updatedTables.find(updated => updated.id === table.id);
          return updatedTable || table;
        }),
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to update tables';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteTable: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await tableApi.deleteTable(id);
      set(state => ({
        tables: state.tables.filter(table => parseInt(table.id, 10) !== id),
        loading: false,
        selectedTable: state.selectedTable?.id === id.toString() ? null : state.selectedTable
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to delete table';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  setSelectedTable: (table: Table | null) => {
    set({ selectedTable: table });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  // Initial state
  step: 1,
  tableCount: 0,
  tempTables: [],
  isCompleted: false,
  loading: false,

  // Actions
  setStep: (step: number) => {
    set({ step });
  },

  setTableCount: (count: number) => {
    set({ tableCount: count });
  },

  generateTables: (count: number, namePrefix: string, defaultLocation: string) => {
    const tables: TempTable[] = Array.from({ length: count }, (_, index) => ({
      name: `${namePrefix} ${index + 1}`,
      capacity: 4, // Default capacity
      location: defaultLocation,
      status: 'available' as const,
    }));
    set({ tempTables: tables });
  },

  updateTempTable: (index: number, data: Partial<TempTable>) => {
    set(state => ({
      tempTables: state.tempTables.map((table, i) => 
        i === index ? { ...table, ...data } : table
      )
    }));
  },

  completeOnboarding: async (tableStore: TableStore) => {
    set({ loading: true });
    try {
      const { tempTables } = get();
      await tableStore.createTablesBulk(tempTables);
      await tableApi.completeOnboarding();
      set({ isCompleted: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  checkOnboardingStatus: async () => {
    try {
      const { completed } = await tableApi.getOnboardingStatus();
      set({ isCompleted: completed });
    } catch {
      // If onboarding status check fails, assume not completed
      set({ isCompleted: false });
    }
  },

  reset: () => {
    set({
      step: 1,
      tableCount: 0,
      tempTables: [],
      isCompleted: false,
      loading: false,
    });
  },
}));
