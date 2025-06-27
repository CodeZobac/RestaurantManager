"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Edit, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Table } from "@/lib/types";

interface BulkEditDropdownProps {
  tables: Table[];
  selectedTables: Table[];
  onTableSelectionChange: (tableId: string, selected: boolean) => void;
  onBulkEdit: (selectedTables: Table[]) => void;
}

export function BulkEditDropdown({ 
  tables, 
  selectedTables,
  onTableSelectionChange,
  onBulkEdit 
}: BulkEditDropdownProps) {
  const t = useTranslations("TableManagement");

  const selectedCount = selectedTables.length;
  const isTableSelected = (tableId: string) => 
    selectedTables.some(table => table.id === tableId);

  const handleBulkEditClick = () => {
    if (selectedCount > 0) {
      onBulkEdit(selectedTables);
    }
  };

  const toggleAllTables = (checked: boolean) => {
    tables.forEach(table => {
      if (checked && !isTableSelected(table.id)) {
        onTableSelectionChange(table.id, true);
      } else if (!checked && isTableSelected(table.id)) {
        onTableSelectionChange(table.id, false);
      }
    });
  };

  const allTablesSelected = tables.length > 0 && tables.every(table => isTableSelected(table.id));
  const someTablesSelected = selectedCount > 0 && selectedCount < tables.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          {t("bulkEdit")}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3">
          <div className="space-y-3">
            {/* Header with select all */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("selectTables")}</span>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allTablesSelected ? true : someTablesSelected ? 'indeterminate' : false}
                  onCheckedChange={toggleAllTables}
                />
                <span className="text-xs text-gray-500">All</span>
              </div>
            </div>

            {/* Selected count */}
            <div className="text-xs text-gray-600">
              {selectedCount > 0 
                ? t("selectedTables", { count: selectedCount })
                : t("noTablesSelected")
              }
            </div>

            {/* Table list */}
            <div className="max-h-48 overflow-y-auto space-y-2 border-t pt-2">
              {tables.map((table) => (
                <div key={table.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      checked={isTableSelected(table.id)}
                      onCheckedChange={(checked) => 
                        onTableSelectionChange(table.id, !!checked)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {table.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {table.capacity} guests • {table.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action button */}
            <div className="border-t pt-2">
              <Button
                onClick={handleBulkEditClick}
                disabled={selectedCount === 0}
                className="w-full"
                size="sm"
              >
                <Edit className="w-3 h-3 mr-2" />
                {selectedCount > 0 
                  ? `Edit ${selectedCount} Tables`
                  : t("selectTablesForBulkEdit")
                }
              </Button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
