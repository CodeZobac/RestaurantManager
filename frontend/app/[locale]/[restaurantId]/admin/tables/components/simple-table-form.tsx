'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SimpleTableFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
}

export function SimpleTableForm({ open, onOpenChange, mode }: SimpleTableFormProps) {
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

  const [formData, setFormData] = useState({
    name: '',
    capacity: '4',
    location: '',
    status: 'available' as 'available' | 'maintenance' | 'pending' | 'occupied',
  });

  const [errors, setErrors] = useState({
    name: '',
    capacity: '',
  });

  useEffect(() => {
    if (isEdit && selectedTable) {
      setFormData({
        name: selectedTable.name,
        capacity: selectedTable.capacity.toString(),
        location: selectedTable.location || '',
        status: selectedTable.status,
      });
    } else if (!isEdit) {
      setFormData({
        name: '',
        capacity: '4',
        location: '',
        status: 'available',
      });
    }
    setErrors({ name: '', capacity: '' });
  }, [isEdit, selectedTable, open]);

  const validateForm = () => {
    const newErrors = { name: '', capacity: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired');
      isValid = false;
    }

    const capacity = parseInt(formData.capacity);
    if (!capacity || capacity < 1) {
      newErrors.capacity = t('capacityMin');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const data = {
        name: formData.name.trim(),
        capacity: parseInt(formData.capacity),
        location: formData.location.trim() || undefined,
        status: formData.status,
      };

      if (isEdit && selectedTable) {
        await updateTable(selectedTable.id, data);
      } else {
        await createTable(data);
      }
      
      onOpenChange(false);
      setSelectedTable(null);
    } catch (error) {
      console.error('Failed to save table:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedTable(null);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('nameLabel')}</Label>
            <Input
              id="name"
              placeholder={t('namePlaceholder')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">{t('capacityLabel')}</Label>
            <Input
              id="capacity"
              type="number"
              placeholder={t('capacityPlaceholder')}
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className={errors.capacity ? 'border-destructive' : ''}
            />
            {errors.capacity && (
              <p className="text-sm text-destructive">{errors.capacity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('locationLabel')}</Label>
            <Input
              id="location"
              placeholder={t('locationPlaceholder')}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t('statusLabel')}</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'available' | 'maintenance' | 'pending' | 'occupied') =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">{tStatus('available')}</SelectItem>
                <SelectItem value="maintenance">{tStatus('maintenance')}</SelectItem>
                <SelectItem value="pending">{tStatus('pending')}</SelectItem>
                <SelectItem value="occupied">{tStatus('occupied')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {isEdit ? t('update') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
