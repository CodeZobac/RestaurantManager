import { setRequestLocale } from "next-intl/server";
import { AnalyticsContent } from "./components/analytics-content";
import Header from "@/components/Header";
import { subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface PageProps {
  params: Promise<{
    locale: string;
    restaurantId: string;
  }>;
}

export default async function AnalyticsPage({
  params,
}: PageProps) {
  const { locale, restaurantId } = await params;
  setRequestLocale(locale);

  const initialDateRange: DateRange = {
    from: subDays(new Date(), 30),
    to: new Date(),
  };

  return (
    <>
      <Header />
      <AnalyticsContent restaurantId={restaurantId} initialDateRange={initialDateRange} />
    </>
  );
}
