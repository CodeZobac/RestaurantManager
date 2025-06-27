'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, X, AlertCircle } from 'lucide-react';
import { useTableStore } from '@/lib/store';
import { Table } from '@/lib/types';

// Form validation schema
const editTableSchema = z.object({
  name: z.string()
    .min(1, 'Table name is required')
    .max(50, 'Table name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Only letters, numbers, spaces, hyphens, and underscores allowed'),
  capacity: z.number()
    .min(1, 'Capacity must be at least 1')
    .max(20, 'Capacity cannot exceed 20 people'),
  location: z.string()
    .min(1, 'Location is required')
    .max(100, 'Location must be less than 100 characters'),
  status: z.enum(['available', 'occupied', 'pending', 'maintenance'], {
    required_error: 'Please select a table status',
  }),
});

type EditTableFormData = z.infer<typeof editTableSchema>;

interface EditFormProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const statusOptions = [
  { 
    value: 'available', 
    label: 'Available', 
    description: 'Table is ready for new reservations',
    variant: 'default' as const,
  },
  { 
    value: 'occupied', 
    label: 'Occupied', 
    description: 'Currently serving customers',
    variant: 'secondary' as const,
  },
  { 
    value: 'pending', 
    label: 'Pending', 
    description: 'Has upcoming reservation',
    variant: 'outline' as const,
  },
  { 
    value: 'maintenance', 
    label: 'Maintenance', 
    description: 'Temporarily out of service',
    variant: 'destructive' as const,
  },
];

export default function EditForm({ table, isOpen, onClose, onSuccess }: EditFormProps) {
  const { updateTable, error, clearError } = useTableStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditTableFormData>({
    resolver: zodResolver(editTableSchema),
    defaultValues: {
      name: '',
      capacity: 4,
      location: '',
      status: 'available',
    },
  });

  // Reset form when table changes or dialog opens
  useEffect(() => {
    if (table && isOpen) {
      form.reset({
        name: table.name,
        capacity: table.capacity,
        location: table.location || '',
        status: table.status as EditTableFormData['status'],
      });
      clearError();
    }
  }, [table, isOpen, form, clearError]);

  const handleClose = () => {
    form.reset();
    clearError();
    onClose();
  };

  const onSubmit = async (data: EditTableFormData) => {
    if (!table) return;

    setIsSubmitting(true);
    try {
      await updateTable(parseInt(table.id, 10), {
        name: data.name.trim(),
        capacity: data.capacity,
        location: data.location.trim(),
        status: data.status,
      });
      
      handleClose();
      onSuccess?.();
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to update table:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStatus = statusOptions.find(option => option.value === form.watch('status'));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center space-x-2">
            <span>Edit Table</span>
            {selectedStatus && (
              <Badge variant={selectedStatus.variant} className="text-xs">
                {selectedStatus.label}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Update table information and status. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6">
            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Table Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Table Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Table 1, Booth A"
                        className="h-10 border-gray-200 focus:border-gray-400 focus:ring-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Capacity */}
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Capacity
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        placeholder="4"
                        className="h-10 border-gray-200 focus:border-gray-400 focus:ring-0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Location
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Main Dining, Patio, Private Room"
                      className="h-10 border-gray-200 focus:border-gray-400 focus:ring-0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Specify the area or section where this table is located
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Status
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 border-gray-200 focus:border-gray-400 focus:ring-0">
                        <SelectValue placeholder="Select table status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting || !form.formState.isValid}
              className="bg-gray-900 hover:bg-gray-800 text-white min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
