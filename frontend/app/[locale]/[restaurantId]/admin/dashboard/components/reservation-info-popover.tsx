'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardTable } from '@/lib/types';
import {  Clock, Users, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReservationInfoPopoverProps {
  table: DashboardTable;
  children: React.ReactNode;
  onEdit?: (table: DashboardTable) => void;
  onDelete?: (table: DashboardTable) => void;
}

export function ReservationInfoPopover({ table, children, onEdit, onDelete }: ReservationInfoPopoverProps) {
  const t = useTranslations('ReservationInfoPopover');
  const [open, setOpen] = useState(false);

  if (!table.reservation) {
    return <>{children}</>;
  }

  const handleEdit = () => {
    onEdit?.(table);
    setOpen(false);
  };

  const handleDelete = () => {
    onDelete?.(table);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="center">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-semibold text-lg">{table.name}</h3>
              <Badge 
                variant="outline" 
                className={`mt-1 ${
                  table.status === 'confirmed'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}
              >
                {table.status === 'confirmed' ? t('confirmed') : t('pending')}
              </Badge>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {table.capacity} {t('seats')}
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{table.reservation.customer_name}</p>
                <p className="text-sm text-gray-600">{t('partyOf')} {table.reservation.party_size}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{table.reservation.reservation_time}</p>
                <p className="text-sm text-gray-600">{t('reservationTime')}</p>
              </div>
            </div>

            {/* Contact Information (if available) */}
            {table.reservation.customer_email && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Mail className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">{table.reservation.customer_email}</p>
                  <p className="text-sm text-gray-600">{t('email')}</p>
                </div>
              </div>
            )}

            {table.reservation.customer_phone && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Phone className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">{table.reservation.customer_phone}</p>
                  <p className="text-sm text-gray-600">{t('phone')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('editButton')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('cancelButton')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
