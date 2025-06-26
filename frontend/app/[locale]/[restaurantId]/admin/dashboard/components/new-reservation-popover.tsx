'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardTable } from '@/lib/types';
import { Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NewReservationPopoverProps {
  table: DashboardTable;
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCreateReservation?: (reservationData: any) => void;
}

interface ReservationFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  party_size: number;
  reservation_time: string;
  special_requests: string;
}

export function NewReservationPopover({ table, children, onCreateReservation }: NewReservationPopoverProps) {
  const t = useTranslations('NewReservationPopover');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReservationFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    party_size: 1,
    reservation_time: '',
    special_requests: ''
  });

  // Only show for available tables
  if (table.reservation) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reservationData = {
        ...formData,
        table_id: table.id,
        reservation_date: new Date().toISOString().split('T')[0], // Today's date
      };

      await onCreateReservation?.(reservationData);
      
      // Reset form and close popover
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        party_size: 1,
        reservation_time: '',
        special_requests: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Failed to create reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ReservationFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate time slots (9 AM to 10 PM in 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        slots.push({ value: time, label: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="center">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Plus className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t('title')}</h3>
                <p className="text-sm text-gray-600">{table.name} • {table.capacity} {t('seats')}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customer_name" className="text-sm font-medium">
                {t('customerNameLabel')}
              </Label>
              <Input
                id="customer_name"
                placeholder={t('customerNamePlaceholder')}
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                required
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="customer_email" className="text-sm font-medium">
                  {t('emailLabel')}
                </Label>
                <Input
                  id="customer_email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone" className="text-sm font-medium">
                  {t('phoneLabel')}
                </Label>
                <Input
                  id="customer_phone"
                  placeholder={t('phonePlaceholder')}
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                />
              </div>
            </div>

            {/* Party Size and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="party_size" className="text-sm font-medium">
                  {t('partySizeLabel')}
                </Label>
                <Select
                  value={formData.party_size.toString()}
                  onValueChange={(value) => handleInputChange('party_size', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('partySizePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(table.capacity, 12) }, (_, i) => i + 1).map(size => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} {size === 1 ? t('guest') : t('guests')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reservation_time" className="text-sm font-medium">
                  {t('timeLabel')}
                </Label>
                <Select
                  value={formData.reservation_time}
                  onValueChange={(value) => handleInputChange('reservation_time', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('timePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {timeSlots.map(slot => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Special Requests */}
            <div className="space-y-2">
              <Label htmlFor="special_requests" className="text-sm font-medium">
                {t('specialRequestsLabel')}
              </Label>
              <Input
                id="special_requests"
                placeholder={t('specialRequestsPlaceholder')}
                value={formData.special_requests}
                onChange={(e) => handleInputChange('special_requests', e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
                disabled={loading}
              >
                {t('cancelButton')}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={loading || !formData.customer_name || !formData.reservation_time}
              >
                {loading ? t('creatingButton') : t('createButton')}
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
