"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTableStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { TablesList } from "./tables-list";
import { SimpleTableForm } from "./simple-table-form";
import { DeleteTableDialog } from "./delete-table-dialog";
import { LanguageSelector } from "@/components/language-selector";
import EditForm from "@/components/EditForm";
import { Table } from "@/lib/types";
import { BulkEditDropdown } from "./bulk-edit-dropdown";
import { BulkEditDialog } from "./bulk-edit-dialog";

interface Props {
  restaurantId: string;
}

export function TablesManagement({ restaurantId }: Props) {
  const t = useTranslations("TableManagement");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedTables, setSelectedTables] = useState<Table[]>([]);
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);

  const { tables, loading, error, fetchTables, clearError, setSelectedTable: setSelectedTableForDelete } = useTableStore();

  useEffect(() => {
    fetchTables(restaurantId);
  }, [fetchTables, restaurantId]);

  const filteredTables = tables.filter(
    (table) =>
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (table: Table) => {
    setSelectedTable(table);
    setIsEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setIsEditDialogOpen(false);
    setSelectedTable(null);
  };

  const handleEditSuccess = () => {
    // Optionally refresh the tables list or show a success message
    fetchTables(restaurantId);
  };

  const handleDeleteClick = (table: Table) => {
    setSelectedTableForDelete(table);
  };

  const handleTableSelectionChange = (tableId: string, selected: boolean) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    setSelectedTables(prev => 
      selected 
        ? [...prev, table]
        : prev.filter(t => t.id !== tableId)
    );
  };

  const handleBulkEdit = () => {
    setIsBulkEditDialogOpen(true);
  };

  const handleBulkEditSuccess = () => {
    setSelectedTables([]);
    fetchTables(restaurantId);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">
            Manage your restaurant tables and seating arrangements
          </p>
        </div>
        <LanguageSelector />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-6 flex justify-between items-center">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            ×
          </Button>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("addNew")}
          </Button>
          <BulkEditDropdown
            tables={filteredTables}
            selectedTables={selectedTables}
            onTableSelectionChange={handleTableSelectionChange}
            onBulkEdit={handleBulkEdit}
          />
        </div>
      </div>

      {/* Tables List */}
      <TablesList
        tables={filteredTables}
        loading={loading}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Dialogs */}
      <SimpleTableForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />
      
      <EditForm
        table={selectedTable}
        isOpen={isEditDialogOpen}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
      />
      
      <DeleteTableDialog />
      
      <BulkEditDialog
        isOpen={isBulkEditDialogOpen}
        onClose={() => setIsBulkEditDialogOpen(false)}
        selectedTables={selectedTables}
        onSuccess={handleBulkEditSuccess}
      />
    </div>
  );
}
