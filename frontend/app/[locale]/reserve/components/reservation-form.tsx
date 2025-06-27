"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { reservationSchema, type ReservationFormData } from "@/lib/schemas";
import { reservationApi, restaurantApi, ApiError } from "@/lib/api";
import { Restaurant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormStatusDisplay } from "@/app/[locale]/reserve/components/form-status-display";
import { TermsCheckbox } from "@/components/terms-checkbox";
import { MapPin, Calendar, Loader2, ChefHat } from "lucide-react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ReservationForm() {
  const t = useTranslations("Reservation");
  const tTerms = useTranslations("TermsOfService");
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    control,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    mode: "onChange",
  });

  // Load restaurants on component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const restaurantData = await restaurantApi.getRestaurants();
        setRestaurants(restaurantData);
      } catch (error) {
        console.error('Failed to load restaurants:', error);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, []);

  const onSubmit = async (data: ReservationFormData) => {
    if (!termsAccepted) {
      setTermsError(tTerms('agreement.required'));
      return;
    }
    
    try {
      setFormStatus("submitting");
      setErrorMessage("");
      setTermsError("");

      const response = await reservationApi.createReservation(data);

      if (response.success) {
        setFormStatus("success");
        reset();
        setTermsAccepted(false);
      } else {
        setFormStatus("error");
        setErrorMessage(response.error || t("status.serverError"));
      }
    } catch (error) {
      setFormStatus("error");
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setErrorMessage(t("status.noTablesAvailable"));
        } else {
          setErrorMessage(t("status.serverError"));
        }
      } else {
        setErrorMessage(t("status.serverError"));
      }
    }
  };

  if (formStatus === "success") {
    return (
      <FormStatusDisplay
        type="success"
        title={t("status.success")}
        message={t("status.successMessage")}
        onReset={() => setFormStatus("idle")}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {formStatus === "error" && (
        <FormStatusDisplay
          type="error"
          title={t("status.error")}
          message={errorMessage}
        />
      )}

      {/* Restaurant Selection Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t("form.selectRestaurant")}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Choose your preferred dining location
          </p>
        </div>

        <div>
          <Label htmlFor="restaurant_id">
            {t("form.restaurant")} *
          </Label>
          {loadingRestaurants ? (
            <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">Loading restaurants...</span>
            </div>
          ) : (
            <Controller
              name="restaurant_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={errors.restaurant_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a restaurant location" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          {restaurant.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
          {errors.restaurant_id && (
            <p className="text-sm text-red-600 mt-1">
              {t(`validation.${errors.restaurant_id.message}`)}
            </p>
          )}
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("form.contactInfo")}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t("form.contactInfoDescription")}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="customer_name">{t("form.customerName")}</Label>
            <Input
              id="customer_name"
              type="text"
              placeholder={t("form.customerNamePlaceholder")}
              {...register("customer_name")}
              className={errors.customer_name ? "border-red-500" : ""}
            />
            {errors.customer_name && (
              <p className="text-sm text-red-600 mt-1">
                {t(`validation.${errors.customer_name.message}`)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_email">{t("form.customerEmail")}</Label>
              <Input
                id="customer_email"
                type="email"
                placeholder={t("form.customerEmailPlaceholder")}
                {...register("customer_email")}
                className={errors.customer_email ? "border-red-500" : ""}
              />
              {errors.customer_email && (
                <p className="text-sm text-red-600 mt-1">
                  {t(`validation.${errors.customer_email.message}`)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="customer_phone">{t("form.customerPhone")}</Label>
              <Input
                id="customer_phone"
                type="tel"
                placeholder={t("form.customerPhonePlaceholder")}
                {...register("customer_phone")}
                className={errors.customer_phone ? "border-red-500" : ""}
              />
              {errors.customer_phone && (
                <p className="text-sm text-red-600 mt-1">
                  {t(`validation.${errors.customer_phone.message}`)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Date & Time Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("form.dateTimeInfo")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reservation_date">
              {t("form.reservationDate")}
            </Label>
            <Input
              id="reservation_date"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              {...register("reservation_date")}
              className={errors.reservation_date ? "border-red-500" : ""}
            />
            {errors.reservation_date && (
              <p className="text-sm text-red-600 mt-1">
                {t(`validation.${errors.reservation_date.message}`)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="reservation_time">
              {t("form.reservationTime")}
            </Label>
            <Input
              id="reservation_time"
              type="time"
              {...register("reservation_time")}
              className={errors.reservation_time ? "border-red-500" : ""}
            />
            {errors.reservation_time && (
              <p className="text-sm text-red-600 mt-1">
                {t(`validation.${errors.reservation_time.message}`)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Party Details Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("form.partyInfo")}
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="party_size">{t("form.partySize")}</Label>
            <Input
              id="party_size"
              type="number"
              min="1"
              max="20"
              placeholder={t("form.partySizePlaceholder")}
              {...register("party_size", { valueAsNumber: true })}
              className={errors.party_size ? "border-red-500" : ""}
            />
            {errors.party_size && (
              <p className="text-sm text-red-600 mt-1">
                {t(`validation.${errors.party_size.message}`)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="special_requests">
              {t("form.specialRequests")}
            </Label>
            <textarea
              id="special_requests"
              rows={4}
              placeholder={t("form.specialRequestsPlaceholder")}
              {...register("special_requests")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.special_requests ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.special_requests && (
              <p className="text-sm text-red-600 mt-1">
                {t(`validation.${errors.special_requests.message}`)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="pt-4">
        <TermsCheckbox
          checked={termsAccepted}
          onCheckedChange={(checked) => {
            setTermsAccepted(checked);
            if (checked) setTermsError("");
          }}
          error={termsError}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <Button
          type="submit"
          disabled={formStatus === "submitting" || !isValid || loadingRestaurants || !termsAccepted}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 text-lg rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {formStatus === "submitting" ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating your reservation...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{t("form.submitButton")}</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
