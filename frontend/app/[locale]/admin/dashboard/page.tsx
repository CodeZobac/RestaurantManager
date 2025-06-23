import { setRequestLocale } from 'next-intl/server';
import { DashboardContent } from './components/dashboard-content';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DashboardContent />;
}
