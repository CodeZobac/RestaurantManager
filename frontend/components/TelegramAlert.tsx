'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';

export function TelegramAlert() {
  const t = useTranslations('TelegramAlert');

  return (
    <Alert variant="warning">
      <TriangleAlert className="h-4 w-4" />
      <AlertTitle>{t('title')}</AlertTitle>
      <AlertDescription>
        {t('message')}
        <Button asChild variant="secondary" size="sm" className="ml-2">
          <Link href="settings">{t('link')}</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
