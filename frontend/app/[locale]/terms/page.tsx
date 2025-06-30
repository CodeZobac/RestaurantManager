import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Clock } from "lucide-react";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service - The Golden Spoon",
  description: "Read our terms of service to understand the rules and regulations for using our platform.",
};

export default function TermsPage() {
  const t = useTranslations("TermsOfService");
  
  const lastUpdated = new Date("2025-01-01").toLocaleDateString();
  
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
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("title")}
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              {t("subtitle")}
            </p>
            
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {t("lastUpdated", { date: lastUpdated })}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="p-8 space-y-8">
              
              {/* Acceptance of Terms */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t("sections.acceptance.title")}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.acceptance.content")}
                </p>
              </section>

              {/* Service Description */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t("sections.serviceDescription.title")}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.serviceDescription.content")}
                </p>
              </section>

              {/* User Responsibilities */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t("sections.userResponsibilities.title")}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.userResponsibilities.content")}
                </p>
              </section>

              {/* Reservation Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t("sections.reservationPolicy.title")}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.reservationPolicy.content")}
                </p>
              </section>

              {/* Privacy Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t("sections.privacyPolicy.title")}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.privacyPolicy.content")}
                </p>
              </section>

              {/* Limitations */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t("sections.limitations.title")}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.limitations.content")}
                </p>
              </section>

              {/* Modifications */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t("sections.modifications.title")}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.modifications.content")}
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {t("sections.contact.title")}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.contact.content")}
                </p>
              </section>

            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                {t('backToHome')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
