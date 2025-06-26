'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock, Utensils, Star, ArrowLeft, ChefHat } from 'lucide-react';
import { Restaurant, MenuItem } from '@/lib/types';

interface RestaurantWithMenu extends Restaurant {
  menuItems: MenuItem[];
}

export default function MenuPage() {
  const t = useTranslations('Menu');
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<RestaurantWithMenu[]>([]);
  const [expandedRestaurant, setExpandedRestaurant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantsWithMenus();
  }, []);

  const fetchRestaurantsWithMenus = async () => {
    try {
      const response = await fetch('/api/public-menus');
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to fetch restaurants and menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurant = (restaurantId: string) => {
    setExpandedRestaurant(expandedRestaurant === restaurantId ? null : restaurantId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appetizer': return 'bg-green-100 text-green-800 border-green-200';
      case 'main': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'dessert': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'beverage': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groupMenuItemsByCategory = (menuItems: MenuItem[]) => {
    return menuItems.reduce((groups, item) => {
      const category = item.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as Record<string, MenuItem[]>);
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'appetizer': return t('categories.appetizer');
      case 'main': return t('categories.main');
      case 'dessert': return t('categories.dessert');
      case 'beverage': return t('categories.beverage');
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-orange-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Restaurant Manager
              </span>
            </div>

            {/* Navigation Button */}
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="flex items-center space-x-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Início</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
              <Utensils className="h-4 w-4" />
              <span>{t('culinaryExcellence')}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              {t('discoverOur')}
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-200 bg-clip-text text-transparent">
                {t('exquisiteMenus')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
              {t('exploreDishes')}
            </p>
            <div className="flex items-center justify-center space-x-8 mt-8">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-300" />
                <span className="text-orange-100">{t('premiumQuality')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-300" />
                <span className="text-orange-100">{t('freshDaily')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Utensils className="h-5 w-5 text-yellow-300" />
                <span className="text-orange-100">{t('expertChefs')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('restaurantPartners')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('restaurantPartnersDescription')}
          </p>
        </div>

        {restaurants.length === 0 ? (
          <div className="text-center py-16">
            <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noMenusAvailable')}</h3>
            <p className="text-gray-600">
              {t('noMenusAvailableDescription')}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {restaurants.map((restaurant) => {
              const isExpanded = expandedRestaurant === restaurant.id;
              const groupedMenuItems = groupMenuItemsByCategory(restaurant.menuItems);

              return (
                <Card 
                  key={restaurant.id} 
                  className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
                >
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => toggleRestaurant(restaurant.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-orange-400 to-rose-400 rounded-lg">
                          <Utensils className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-gray-900">{restaurant.name}</CardTitle>
                          <CardDescription className="text-gray-600 mt-1">
                            
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {t('itemCount', { count: restaurant.menuItems.length })}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-5 w-5 mr-1" />
                              {t('hideMenu')}
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-5 w-5 mr-1" />
                              {t('viewMenu')}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="border-t bg-gray-50/50">
                      <div className="py-6">
                        {Object.entries(groupedMenuItems).map(([category, items]) => (
                          <div key={category} className="mb-8 last:mb-0">
                            <div className="flex items-center space-x-2 mb-4">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {getCategoryDisplayName(category)}
                              </h3>
                              <div className="flex-1 h-px bg-gray-200"></div>
                              <Badge className={getCategoryColor(category)}>
                                {t('itemCount', { count: items.length })}
                              </Badge>
                            </div>
                            
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                              {items.map((item) => (
                                <Card 
                                  key={item.id} 
                                  className="bg-white border hover:shadow-md transition-shadow duration-200"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-semibold text-gray-900 leading-tight">
                                        {item.name}
                                      </h4>
                                      <span className="text-lg font-bold text-orange-600 ml-2">
                                        ${item.price.toFixed(2)}
                                      </span>
                                    </div>
                                    {item.description && (
                                      <p className="text-sm text-gray-600 leading-relaxed">
                                        {item.description}
                                      </p>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white">
        <div className="container mx-auto px-4 py-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            {t('readyToExperience')}
          </h3>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            {t('bookYourTable')}
          </p>
          <Button 
            size="lg" 
            className="bg-white text-orange-600 hover:bg-orange-50 transition-colors duration-200 px-8 py-3 text-lg font-semibold"
          >
            {t('makeReservation')}
          </Button>
        </div>
      </div>
    </div>
  );
}
