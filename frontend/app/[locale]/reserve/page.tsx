import { useTranslations } from "next-intl";
import { ReservationForm } from "@/app/[locale]/reserve/components/reservation-form";

export default function ReservePage() {
  const t = useTranslations("Reservation");

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("title")}
            </h1>
            <p className="text-lg text-gray-600">{t("subtitle")}</p>
          </div>

          <ReservationForm />
        </div>
      </div>
    </div>
  );
}
