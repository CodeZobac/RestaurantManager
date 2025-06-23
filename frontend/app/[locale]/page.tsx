import {setRequestLocale} from 'next-intl/server';
import {redirect} from '@/i18n/navigation';

interface PageProps {
  params: Promise<{locale: string}>;
}

export default async function HomePage({params}: PageProps) {
  const {locale} = await params;
  setRequestLocale(locale);

  // For now, redirect to tables management
  // Later we'll add logic to check onboarding status
  redirect({href: '/admin/tables', locale});
}
