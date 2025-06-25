'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Languages } from 'lucide-react';
import { routing } from '@/i18n/routing';

export function LanguageSelector() {
  const t = useTranslations('LanguageSelector');
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (locale: string) => {
    router.replace(pathname, { locale });
  };

  return (
    <Select onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <Languages className="h-4 w-4 mr-2" />
        <SelectValue placeholder={t('selectLanguage')} />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {locale === 'en' ? t('english') : t('portuguese')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
