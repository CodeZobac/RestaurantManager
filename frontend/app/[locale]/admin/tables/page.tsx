import { setRequestLocale } from "next-intl/server";
import { TablesManagement } from "./components/tables-management";
import Header from "@/components/Header";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TablesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <TablesManagement />
    </>
  );
}
