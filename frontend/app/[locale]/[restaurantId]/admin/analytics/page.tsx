import { setRequestLocale } from "next-intl/server";
import { AnalyticsContent } from "./components/analytics-content";
import Header from "@/components/Header";

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

  return (
    <>
      <Header />
      <AnalyticsContent restaurantId={restaurantId} />
    </>
  );
}
