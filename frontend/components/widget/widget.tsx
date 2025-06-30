"use client";

import { useState, useEffect } from "react";
import { Fab } from "./fab";
import { ReservationFormWidget } from "./reservation-form";
import { restaurantApi } from "@/lib/api";
import { Restaurant } from "@/lib/types";

interface WidgetProps {
  restaurantId: string;
}

export function Widget({ restaurantId }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setIsLoading(true);
        const data = await restaurantApi.getRestaurantById(restaurantId);
        if (data) {
          setRestaurant(data);
        } else {
          setError("Restaurant not found.");
        }
      } catch {
        setError("Failed to load restaurant data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurantId) {
      fetchRestaurant();
    } else {
      setError("No restaurant ID provided.");
      setIsLoading(false);
    }
  }, [restaurantId]);

  if (isLoading) {
    return null; // Or a loading spinner if you prefer
  }

  if (error) {
    console.error("Widget Error:", error);
    return null; // Don't render the widget if there's an error
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div>
      <Fab onClick={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <ReservationFormWidget
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
