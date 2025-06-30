'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function BackButton() {
  const t = useTranslations('Maps');
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push('/')}
      className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-gray-300 shadow-lg hover:bg-white/80 hover:border-gray-400 transition-all duration-300 text-gray-900 hover:text-gray-900 rounded-xl"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="font-medium">{t('backToHome')}</span>
    </Button>
  );
}
