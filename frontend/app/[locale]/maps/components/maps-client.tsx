'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Restaurant } from '@/lib/types';
import { MapComponent } from './map-component';
import { RestaurantSidebar } from './restaurant-sidebar';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function MapsClient() {
  const t = useTranslations('Maps');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/restaurants');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process restaurants and parse location data
      const processedRestaurants = data.map((restaurant: Restaurant) => ({
        ...restaurant,
        location: typeof restaurant.location === 'string' 
          ? JSON.parse(restaurant.location) 
          : restaurant.location
      })).filter((restaurant: Restaurant) => 
        restaurant.name && // Ensure name exists for the sidebar
        restaurant.location && 
        typeof restaurant.location === 'object' &&
        restaurant.location.lat && // Use 'lat' and 'lng' as per schema example
        restaurant.location.lng &&
        restaurant.location.address // Ensure address exists for the sidebar
      );

      setRestaurants(processedRestaurants);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleRetry = () => {
    fetchRestaurants();
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleMarkerClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setSidebarOpen(true);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md p-6">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">{t('error')}</h3>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t('noRestaurants')}</h3>
            <p className="text-muted-foreground mt-2">
              No restaurant locations are available at the moment.
            </p>
          </div>
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex relative">
      {/* Sidebar */}
      <RestaurantSidebar
        restaurants={restaurants}
        selectedRestaurant={selectedRestaurant}
        onRestaurantSelect={handleRestaurantSelect}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Map */}
      <div className="flex-1 relative">
        <MapComponent
          restaurants={restaurants}
          selectedRestaurant={selectedRestaurant}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </div>
  );
}
