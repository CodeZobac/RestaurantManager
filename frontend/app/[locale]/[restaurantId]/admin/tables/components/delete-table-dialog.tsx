'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useTableStore } from '@/lib/store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function DeleteTableDialog() {
  const t = useTranslations('DeleteDialog');
  
  const {
    selectedTable,
    deleteTable,
    loading,
    setSelectedTable,
  } = useTableStore();

  const isOpen = selectedTable !== null;

  const handleDelete = async () => {
    if (selectedTable) {
      try {
        await deleteTable(parseInt(selectedTable.id, 10));
        setSelectedTable(null);
      } catch (error) {
        console.error('Failed to delete table:', error);
      }
    }
  };

  const handleCancel = () => {
    setSelectedTable(null);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('description')}
            {selectedTable && (
              <span className="font-medium"> &ldquo;{selectedTable.name}&rdquo;</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
