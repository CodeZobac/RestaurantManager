'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tableSchema, TableFormData } from '@/lib/schemas';
import { useTableStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
}

export function TableFormDialog({ open, onOpenChange, mode }: TableFormDialogProps) {
  const t = useTranslations('TableForm');
  const tStatus = useTranslations('Status');
  
  const {
    selectedTable,
    createTable,
    updateTable,
    loading,
    setSelectedTable,
  } = useTableStore();

  const isEdit = mode === 'edit' && selectedTable;

  const form = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      name: '',
      capacity: 4,
      location: '',
      status: 'available',
    },
  });

  useEffect(() => {
    if (isEdit && selectedTable) {
      form.reset({
        name: selectedTable.name,
        capacity: selectedTable.capacity,
        location: selectedTable.location || '',
        status: selectedTable.status,
      });
    } else if (!isEdit) {
      form.reset({
        name: '',
        capacity: 4,
        location: '',
        status: 'available',
      });
    }
  }, [isEdit, selectedTable, form]);

  const onSubmit = async (data: TableFormData) => {
    try {
      if (isEdit && selectedTable) {
        await updateTable(parseInt(selectedTable.id, 10), data);
      } else {
        await createTable(data);
      }
      onOpenChange(false);
      setSelectedTable(null);
      form.reset();
    } catch (error) {
      // Error is handled by the store
      console.error('Failed to save table:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedTable(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('editTitle') : t('createTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('capacityLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('capacityPlaceholder')}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('locationLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('locationPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('statusLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">{tStatus('available')}</SelectItem>
                      <SelectItem value="maintenance">{tStatus('maintenance')}</SelectItem>
                      <SelectItem value="pending">{tStatus('pending')}</SelectItem>
                      <SelectItem value="confirmed">{tStatus('confirmed')}</SelectItem>
                      <SelectItem value="occupied">{tStatus('occupied')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {isEdit ? t('update') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
