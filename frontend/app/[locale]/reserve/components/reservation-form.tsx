"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { reservationSchema, type ReservationFormData } from "@/lib/schemas";
import { reservationApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormStatusDisplay } from "@/app/[locale]/reserve/components/form-status-display";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ReservationForm() {
  const t = useTranslations("Reservation");
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ReservationFormData) => {
    try {
      setFormStatus("submitting");
      setErrorMessage("");

      const response = await reservationApi.createReservation(data);

      if (response.success) {
        setFormStatus("success");
        reset();
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

      {/* Submit Button */}
      <div className="pt-6">
        <Button
          type="submit"
          disabled={formStatus === "submitting" || !isValid}
          className="w-full"
        >
          {formStatus === "submitting"
            ? t("form.submitting")
            : t("form.submitButton")}
        </Button>
      </div>
    </form>
  );
}
