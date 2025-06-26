import { setRequestLocale } from "next-intl/server";
import { DashboardContent } from "./components/dashboard-content";
import Header from "@/components/Header";

interface PageProps {
  params: Promise<{
    locale: string;
    restaurantId: string;
  }>;
}

export default async function DashboardPage({
  params,
}: PageProps) {
  const { locale, restaurantId } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <DashboardContent restaurantId={restaurantId} />
    </>
  );
}
