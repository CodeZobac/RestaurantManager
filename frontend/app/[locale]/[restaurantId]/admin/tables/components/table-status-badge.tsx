'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface TableStatusBadgeProps {
  status: 'available' | 'maintenance' | 'reserved';
}

export function TableStatusBadge({ status }: TableStatusBadgeProps) {
  const t = useTranslations('Status');

  const getVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default'; // Green
      case 'maintenance':
        return 'secondary'; // Yellow
      case 'reserved':
        return 'destructive'; // Red
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getVariant(status)}>
      {t(status)}
    </Badge>
  );
}
