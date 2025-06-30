'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { DashboardTable } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: DashboardTable | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (reservationData: any) => void;
  initialData?: ReservationFormData;
}

export interface ReservationFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  party_size: number;
  reservation_time: string;
  special_requests: string;
}

export function ReservationModal({
  isOpen,
  onClose,
  table,
  onSubmit,
  initialData,
}: ReservationModalProps) {
  const t = useTranslations('ReservationModal');
  const [formData, setFormData] = useState<ReservationFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    party_size: 1,
    reservation_time: '',
    special_requests: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        party_size: 1,
        reservation_time: '',
        special_requests: '',
      });
    }
  }, [initialData]);

  if (!table) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ ...formData, table_id: table.id });
      onClose();
    } catch (error) {
      console.error('Failed to submit reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof ReservationFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString(
          'en-US',
          {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }
        );
        slots.push({ value: time, label: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? t('editTitle') : t('createTitle')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">{t('customerNameLabel')}</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) =>
                handleInputChange('customer_name', e.target.value)
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_email">{t('emailLabel')}</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) =>
                  handleInputChange('customer_email', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone">{t('phoneLabel')}</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) =>
                  handleInputChange('customer_phone', e.target.value)
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="party_size">{t('partySizeLabel')}</Label>
              <Select
                value={formData.party_size.toString()}
                onValueChange={(value) =>
                  handleInputChange('party_size', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: Math.min(table.capacity, 12) },
                    (_, i) => i + 1
                  ).map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} {size === 1 ? t('guest') : t('guests')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservation_time">{t('timeLabel')}</Label>
              <Select
                value={formData.reservation_time}
                onValueChange={(value) =>
                  handleInputChange('reservation_time', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="special_requests">
              {t('specialRequestsLabel')}
            </Label>
            <Input
              id="special_requests"
              value={formData.special_requests}
              onChange={(e) =>
                handleInputChange('special_requests', e.target.value)
              }
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancelButton')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('savingButton') : t('saveButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
