'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface TableStatusBadgeProps {
  status: 'available' | 'maintenance' | 'pending' | 'occupied';
}

export function TableStatusBadge({ status }: TableStatusBadgeProps) {
  const t = useTranslations('Status');

  const getVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default'; // Green
      case 'maintenance':
        return 'secondary'; // Yellow
      case 'pending':
        return 'destructive'; // Red
      case 'occupied':
        return 'outline'; // Blue
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
