"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema, type ReservationFormData } from "@/lib/schemas";
import { reservationApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";

interface ReservationFormWidgetProps {
  restaurantId: string;
  restaurantName: string;
  onClose: () => void;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ReservationFormWidget({
  restaurantId,
  restaurantName,
  onClose,
}: ReservationFormWidgetProps) {
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    mode: "onChange",
  });

  useEffect(() => {
    setValue("restaurant_id", restaurantId);
  }, [restaurantId, setValue]);

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
        setErrorMessage(response.error || "An unknown error occurred.");
      }
    } catch (error) {
      setFormStatus("error");
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setErrorMessage("No tables available for the selected time.");
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  if (formStatus === "success") {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-semibold text-green-700">Reservation Successful!</h3>
        <p className="text-sm text-gray-600 mt-2">
          Your table has been booked. You will receive a confirmation email shortly.
        </p>
        <Button onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-8 w-96 bg-white rounded-lg shadow-2xl border border-gray-200">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold">Reserve at {restaurantName}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
        {formStatus === "error" && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm">
            <p>{errorMessage}</p>
          </div>
        )}
        <div>
          <Label htmlFor="customer_name">Name</Label>
          <Input id="customer_name" {...register("customer_name")} />
          {errors.customer_name && <p className="text-xs text-red-600 mt-1">{errors.customer_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="customer_email">Email</Label>
          <Input id="customer_email" type="email" {...register("customer_email")} />
          {errors.customer_email && <p className="text-xs text-red-600 mt-1">{errors.customer_email.message}</p>}
        </div>
        <div>
          <Label htmlFor="customer_phone">Phone</Label>
          <Input id="customer_phone" type="tel" {...register("customer_phone")} />
          {errors.customer_phone && <p className="text-xs text-red-600 mt-1">{errors.customer_phone.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reservation_date">Date</Label>
            <Input id="reservation_date" type="date" {...register("reservation_date")} />
            {errors.reservation_date && <p className="text-xs text-red-600 mt-1">{errors.reservation_date.message}</p>}
          </div>
          <div>
            <Label htmlFor="reservation_time">Time</Label>
            <Input id="reservation_time" type="time" {...register("reservation_time")} />
            {errors.reservation_time && <p className="text-xs text-red-600 mt-1">{errors.reservation_time.message}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="party_size">Party Size</Label>
          <Input id="party_size" type="number" {...register("party_size", { valueAsNumber: true })} />
          {errors.party_size && <p className="text-xs text-red-600 mt-1">{errors.party_size.message}</p>}
        </div>
        <Button type="submit" disabled={formStatus === "submitting" || !isValid} className="w-full">
          {formStatus === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reserve"}
        </Button>
      </form>
    </div>
  );
}
