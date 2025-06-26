import { useTranslations } from "next-intl";
import { ReservationForm } from "@/app/[locale]/reserve/components/reservation-form";
import { Badge } from "@/components/ui/badge";
import { CalendarHeart, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function ReservePage() {
  const t = useTranslations("Reservation");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToHome')}
            </Button>
          </Link>
          
          <div className="text-center">
            <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
              <Sparkles className="w-4 h-4 mr-2" />
              {t('reserveYourTable')}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("title")}
              <span className="block text-3xl md:text-4xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {t('experience')}
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <CalendarHeart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {t('reservationDetails')}
                  </h2>
                  <p className="text-orange-100 text-sm">
                    {t('fillInDetails')}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <ReservationForm />
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('needHelp')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('specialOccasions')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
