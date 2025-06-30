'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Restaurant } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, ExternalLink, Navigation } from 'lucide-react';
import Image from 'next/image';

interface MapComponentProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onMarkerClick: (restaurant: Restaurant) => void;
  apiKey: string;
}

interface MapWrapperProps {
    restaurants: Restaurant[];
    selectedRestaurant: Restaurant | null;
    onMarkerClick: (restaurant: Restaurant) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Default center (you can change this to your preferred location)
const defaultCenter = {
  lat: 40.7128, // New York City
  lng: -74.0060,
};

// Custom map styles for a more elegant look
const mapStyles = [
  {
    featureType: 'all',
    elementType: 'geometry.fill',
    stylers: [{ weight: '2.00' }],
  },
  {
    featureType: 'all',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#9c9c9c' }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'landscape',
    elementType: 'all',
    stylers: [{ color: '#f2f2f2' }],
  },
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'all',
    stylers: [{ saturation: -100 }, { lightness: 45 }],
  },
  {
    featureType: 'water',
    elementType: 'all',
    stylers: [{ color: '#46bcec' }, { visibility: 'on' }],
  },
];

function MapWithApiKey({ restaurants, onMarkerClick, apiKey }: MapComponentProps) {
  const t = useTranslations('Maps');
  const [, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindowRestaurant, setInfoWindowRestaurant] = useState<Restaurant | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  // Calculate center based on restaurants
  const mapCenter = useMemo(() => {
    if (restaurants.length === 0) return defaultCenter;
    
    let totalLat = 0;
    let totalLng = 0;
    let validLocations = 0;

    restaurants.forEach(restaurant => {
      if (restaurant.location && typeof restaurant.location === 'object' && 'lat' in restaurant.location && 'lng' in restaurant.location) {
        totalLat += restaurant.location.lat;
        totalLng += restaurant.location.lng;
        validLocations++;
      }
    });

    if (validLocations === 0) return defaultCenter;

    return {
      lat: totalLat / validLocations,
      lng: totalLng / validLocations,
    };
  }, [restaurants]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (restaurant: Restaurant) => {
    setInfoWindowRestaurant(restaurant);
    onMarkerClick(restaurant);
  };

  const handleInfoWindowClose = () => {
    setInfoWindowRestaurant(null);
  };

  const getDirections = (restaurant: Restaurant) => {
    const location = parseLocation(restaurant.location);
    if (location && location.lat && location.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
      window.open(url, '_blank');
    }
  };

  const parseLocation = (location: Restaurant['location']) => {
    if (typeof location === 'string') {
      try {
        return JSON.parse(location);
      } catch {
        return null;
      }
    }
    return location;
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={restaurants.length > 0 ? 12 : 10}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: mapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
      }}
    >
      {restaurants.map((restaurant) => {
        const location = parseLocation(restaurant.location);
        if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') return null;

        return (
          <Marker
            key={restaurant.id}
            position={{
              lat: location.lat,
              lng: location.lng,
            }}
            onClick={() => handleMarkerClick(restaurant)}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#dc2626" stroke="white" stroke-width="3"/>
                  <circle cx="16" cy="16" r="4" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16),
            }}
          />
        );
      })}

      {infoWindowRestaurant && (
        <InfoWindow
          position={{
            lat: parseLocation(infoWindowRestaurant.location)?.lat || 0,
            lng: parseLocation(infoWindowRestaurant.location)?.lng || 0,
          }}
          onCloseClick={handleInfoWindowClose}
        >
          <div className="p-2 max-w-sm">
            {infoWindowRestaurant.photo && (
              <Image
                src={infoWindowRestaurant.photo}
                alt={infoWindowRestaurant.name}
                width={300}
                height={128}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
            )}
            <h3 className="font-semibold text-lg mb-2">{infoWindowRestaurant.name}</h3>
            
            {infoWindowRestaurant.description && (
              <p className="text-sm text-gray-600 mb-3">{infoWindowRestaurant.description}</p>
            )}

            <div className="space-y-2 text-sm">
              {parseLocation(infoWindowRestaurant.location)?.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{parseLocation(infoWindowRestaurant.location)?.address}</span>
                </div>
              )}
              
              {infoWindowRestaurant.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">{infoWindowRestaurant.phone}</span>
                </div>
              )}
              
              {infoWindowRestaurant.hours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">{infoWindowRestaurant.hours}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => getDirections(infoWindowRestaurant)}
                className="flex-1"
              >
                <Navigation className="h-3 w-3 mr-1" />
                {t('directions')}
              </Button>
              
              {infoWindowRestaurant.website && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(infoWindowRestaurant.website, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <div className="h-full flex items-center justify-center bg-muted/20">
      <div className="text-center space-y-2">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  );
}

export function MapComponent({ restaurants, selectedRestaurant, onMarkerClick }: MapWrapperProps) {
    const [apiKey, setApiKey] = useState('');
  
    useEffect(() => {
      const fetchApiKey = async () => {
        try {
          const response = await fetch('/api/maps');
          const data = await response.json();
          setApiKey(data.apiKey);
        } catch (error) {
          console.error('Failed to fetch API key:', error);
        }
      };
  
      fetchApiKey();
    }, []);
  
    if (!apiKey) {
      return (
        <div className="h-full flex items-center justify-center bg-muted/20">
          <div className="text-center space-y-2">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">Loading Map...</p>
          </div>
        </div>
      );
    }
  
    return <MapWithApiKey restaurants={restaurants} selectedRestaurant={selectedRestaurant} onMarkerClick={onMarkerClick} apiKey={apiKey} />;
  }
