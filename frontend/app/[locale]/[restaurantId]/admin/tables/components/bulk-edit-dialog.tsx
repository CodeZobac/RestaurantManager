"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTableStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table } from "@/lib/types";
import { Edit, Loader2 } from "lucide-react";

const bulkEditSchema = z.object({
  capacity: z.number().min(1).optional(),
  location: z.string().optional(),
  status: z.enum(["available", "maintenance", "occupied", "pending"]).optional(),
});

type BulkEditData = z.infer<typeof bulkEditSchema>;

type Status = "available" | "maintenance" | "occupied" | "pending";

interface BulkEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTables: Table[];
  onSuccess?: () => void;
}

export function BulkEditDialog({ 
  isOpen, 
  onClose, 
  selectedTables,
  onSuccess 
}: BulkEditDialogProps) {
  const t = useTranslations("TableManagement");
  const tStatus = useTranslations("Status");
  const { updateBulkTables, loading } = useTableStore();

  const [fieldsToUpdate, setFieldsToUpdate] = useState({
    capacity: false,
    location: false,
    status: false,
  });

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<BulkEditData>({
    resolver: zodResolver(bulkEditSchema),
  });

  const handleFieldToggle = (field: keyof typeof fieldsToUpdate, checked: boolean) => {
    setFieldsToUpdate(prev => ({ ...prev, [field]: checked }));
    if (!checked) {
      setValue(field, undefined);
    }
  };

  const onSubmit = async (data: BulkEditData) => {
    try {
      // Filter only the fields that user wants to update
      const updateData: Partial<BulkEditData> = {};
      if (fieldsToUpdate.capacity && data.capacity) {
        updateData.capacity = data.capacity;
      }
      if (fieldsToUpdate.location && data.location) {
        updateData.location = data.location;
      }
      if (fieldsToUpdate.status && data.status) {
        updateData.status = data.status;
      }

      // Update all selected tables
      const tableIds = selectedTables.map(table => table.id);
      await updateBulkTables(tableIds, updateData);
      
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Failed to update tables:", error);
    }
  };

  const handleClose = () => {
    reset();
    setFieldsToUpdate({
      capacity: false,
      location: false,
      status: false,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            {t("bulkEdit")} ({selectedTables.length} {t("tables")})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Selected Tables Preview */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Selected Tables:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              {selectedTables.slice(0, 3).map(table => (
                <div key={table.id} className="flex justify-between">
                  <span>{table.name}</span>
                  <span className="text-xs text-gray-500">
                    {table.capacity} guests • {table.location}
                  </span>
                </div>
              ))}
              {selectedTables.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{selectedTables.length - 3} more tables
                </div>
              )}
            </div>
          </div>

          {/* Capacity Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={fieldsToUpdate.capacity}
                onCheckedChange={(checked) => handleFieldToggle("capacity", !!checked)}
              />
              <Label className="text-sm font-medium">Update Capacity</Label>
            </div>
            {fieldsToUpdate.capacity && (
              <Input
                type="number"
                min="1"
                placeholder="Enter capacity"
                {...register("capacity", { valueAsNumber: true })}
                className={errors.capacity ? "border-red-500" : ""}
              />
            )}
            {errors.capacity && (
              <p className="text-sm text-red-600">{errors.capacity.message}</p>
            )}
          </div>

          {/* Location Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={fieldsToUpdate.location}
                onCheckedChange={(checked) => handleFieldToggle("location", !!checked)}
              />
              <Label className="text-sm font-medium">Update Location</Label>
            </div>
            {fieldsToUpdate.location && (
              <Input
                placeholder="Enter location"
                {...register("location")}
                className={errors.location ? "border-red-500" : ""}
              />
            )}
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={fieldsToUpdate.status}
                onCheckedChange={(checked) => handleFieldToggle("status", !!checked)}
              />
              <Label className="text-sm font-medium">Update Status</Label>
            </div>
            {fieldsToUpdate.status && (
              <Select onValueChange={(value: Status) => setValue("status", value)}>
                <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">{tStatus("available")}</SelectItem>
                  <SelectItem value="maintenance">{tStatus("maintenance")}</SelectItem>
                  <SelectItem value="occupied">{tStatus("occupied")}</SelectItem>
                  <SelectItem value="pending">{tStatus("pending")}</SelectItem>
                </SelectContent>
              </Select>
            )}
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !Object.values(fieldsToUpdate).some(Boolean)}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                `Update ${selectedTables.length} Tables`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
