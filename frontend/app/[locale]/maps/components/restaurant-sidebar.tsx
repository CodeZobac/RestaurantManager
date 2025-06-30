'use client';

import { useState } from 'react';
import { Restaurant } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  ExternalLink,
  Navigation,
  Calendar,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';

interface RestaurantSidebarProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onRestaurantSelect: (restaurant: Restaurant) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function RestaurantSidebar({
  restaurants,
  selectedRestaurant,
  onRestaurantSelect,
  isOpen,
  onToggle,
}: RestaurantSidebarProps) {
  const t = useTranslations('Maps');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const parseLocation = (location: Restaurant['location']) => {
    if (typeof location === 'string') {
      try {
        return JSON.parse(location) as { lat: number; lng: number; address: string };
      } catch {
        return null;
      }
    }
    return location;
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const location = parseLocation(restaurant.location);
    return restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location?.address?.toLowerCase().includes(searchQuery.toLowerCase())
  });

  const getDirections = (restaurant: Restaurant) => {
    const location = parseLocation(restaurant.location);
    if (location && location.lat && location.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
      window.open(url, '_blank');
    }
  };

  const makeReservation = (restaurant: Restaurant) => {
    // Navigate to reservation page with restaurant pre-selected
    router.push(`/reserve?restaurantId=${restaurant.id}`);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-in-out",
          "lg:relative lg:top-0",
          // Proper glassmorphism with better contrast
          "bg-white/80 backdrop-blur-md border-r border-white/30 shadow-xl",
          "supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:backdrop-blur-lg",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isOpen ? "w-96" : "lg:w-12"
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="absolute -right-10 top-16 z-50 bg-white/70 backdrop-blur-md border border-gray-300 shadow-lg hover:bg-white/80 hover:border-gray-400 transition-all duration-300 lg:flex hidden text-gray-900"
          aria-label={isOpen ? t('closeSidebar') : t('openSidebar')}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        {/* Collapsed state for desktop */}
        {!isOpen && (
          <div className="hidden lg:flex flex-col items-center py-4 space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-2"
              aria-label={t('openSidebar')}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Full sidebar content */}
        {isOpen && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200/50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">{t('restaurantList')}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="lg:hidden text-gray-700 hover:bg-gray-200/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/40 border-gray-300/50 text-gray-900 placeholder:text-gray-500 focus:bg-white/60 focus:border-gray-400/70"
                />
              </div>
            </div>

            {/* Restaurant List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredRestaurants.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {searchQuery ? 'No restaurants match your search' : t('noRestaurants')}
                  </p>
                </div>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <Card
                    key={restaurant.id}
                    className={cn(
                      "cursor-pointer transition-all duration-300 bg-white/50 backdrop-blur-sm border border-gray-200/50 hover:bg-white/70 hover:border-gray-300/60 shadow-lg hover:shadow-xl",
                      "supports-[backdrop-filter]:bg-white/40 supports-[backdrop-filter]:backdrop-blur-md",
                      selectedRestaurant?.id === restaurant.id && "ring-2 ring-blue-400/60 bg-white/60 border-blue-300/50 shadow-xl"
                    )}
                    onClick={() => onRestaurantSelect(restaurant)}
                  >
                    <CardContent className="p-4">
                      {/* Restaurant Image */}
                      {restaurant.photo && (
                        <div className="aspect-video w-full mb-3 overflow-hidden rounded-md">
                          <Image
                            src={restaurant.photo}
                            alt={restaurant.name}
                            width={300}
                            height={168}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}

                      {/* Restaurant Info */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-base leading-tight text-gray-900">{restaurant.name}</h3>
                          <div className="flex items-center gap-1 ml-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">4.8</span>
                          </div>
                        </div>

                        {restaurant.description && (
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {restaurant.description}
                          </p>
                        )}

                        {parseLocation(restaurant.location)?.address && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{parseLocation(restaurant.location)?.address}</span>
                          </div>
                        )}

                        {restaurant.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span>{restaurant.phone}</span>
                          </div>
                        )}

                        {restaurant.hours && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{restaurant.hours}</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              makeReservation(restaurant);
                            }}
                            className="flex-1 text-xs bg-blue-500 text-white hover:bg-blue-600 border-blue-500 hover:border-blue-600"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {t('makeReservation')}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              getDirections(restaurant);
                            }}
                            className="px-2 bg-white/60 border-gray-300/60 text-gray-700 hover:bg-white/80 hover:border-gray-400/70"
                          >
                            <Navigation className="h-3 w-3" />
                          </Button>

                          {restaurant.website && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(restaurant.website, '_blank');
                              }}
                              className="px-2 bg-white/60 border-gray-300/60 text-gray-700 hover:bg-white/80 hover:border-gray-400/70"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Selected Restaurant Details */}
            {selectedRestaurant && (
              <div className="border-t bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground mb-2">
                  {t('restaurantDetails')}
                </div>
                <div className="font-medium text-sm">{selectedRestaurant.name}</div>
                {parseLocation(selectedRestaurant.location)?.address && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {parseLocation(selectedRestaurant.location)?.address}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
