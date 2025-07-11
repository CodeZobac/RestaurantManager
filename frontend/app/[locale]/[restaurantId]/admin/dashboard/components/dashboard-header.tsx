'use client';

import { useTranslations } from 'next-intl';
import { DatePicker } from './date-picker';
import { Admin } from '@/lib/types';
import { TelegramAlert } from '@/components/TelegramAlert';

interface DashboardHeaderProps {
  selectedDate?: Date;
  onDateChange: (date: Date | undefined) => void;
  admin: Admin | null;
}

export function DashboardHeader({ selectedDate, onDateChange, admin }: DashboardHeaderProps) {
  const t = useTranslations('Dashboard');

  return (
    <>
      {!admin?.telegram_chat_id && <TelegramAlert />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('tableStatus')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="w-full sm:w-64">
          <DatePicker
            value={selectedDate}
            onChange={onDateChange}
            placeholder={t('selectDate')}
          />
        </div>
        </div>
      </div>
    </>
  );
}
