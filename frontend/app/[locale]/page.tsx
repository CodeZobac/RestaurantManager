"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  ChefHat, 
  Shield,  
  Heart,
  ArrowRight,
  Menu,
  X,
  User,
  Sparkles,
  Globe
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


export default function RestaurantLandingPage() {
  const t = useTranslations('LandingPage');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Simulate scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const heroImages = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  ];

  const features = [
    {
      icon: Calendar,
      title: t('easyBookingTitle'),
      description: t('easyBookingDescription')
    },
    {
      icon: Clock,
      title: t('realtimeAvailabilityTitle'),
      description: t('realtimeAvailabilityDescription')
    },
    {
      icon: Users,
      title: t('groupFriendlyTitle'),
      description: t('groupFriendlyDescription')
    },
    {
      icon: Shield,
      title: t('guaranteedSeatingTitle'),
      description: t('guaranteedSeatingDescription')
    }
  ];

  const testimonials = [
    {
      name: t('testimonial1Name'),
      text: t('testimonial1Text'),
      rating: 5
    },
    {
      name: t('testimonial2Name'),
      text: t('testimonial2Text'),
      rating: 5
    },
    {
      name: t('testimonial3Name'),
      text: t('testimonial3Text'),
      rating: 5
    }
  ];

  const handleReservation = () => {
    router.push('/reserve');
  };

  const handleLogin = () => {
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {t('brandName')}
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#menu" className={`transition-colors hover:text-orange-600 ${isScrolled ? 'text-gray-700' : 'text-white'}`}>{t('navMenu')}</a>
              <a href="#about" className={`transition-colors hover:text-orange-600 ${isScrolled ? 'text-gray-700' : 'text-white'}`}>{t('navAbout')}</a>
              <a href="#contact" className={`transition-colors hover:text-orange-600 ${isScrolled ? 'text-gray-700' : 'text-white'}`}>{t('navContact')}</a>
              
              <Button variant="ghost" size="sm" onClick={handleLogin} className={`hover:text-orange-600 ${isScrolled ? 'text-gray-600' : 'text-white'}`}>
                <User className="w-4 h-4 mr-2" />
                {t('managerLogin')}
              </Button>

              <Button 
                onClick={handleReservation}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('makeReservationButton')}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={`hover:bg-white/10 ${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white'}`}>
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md border-gray-200/50 shadow-lg">
                  <DropdownMenuItem 
                    onClick={() => router.replace(pathname, { locale: 'en' })}
                    className={`cursor-pointer ${locale === 'en' ? 'bg-orange-100 text-orange-700' : ''}`}
                  >
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.replace(pathname, { locale: 'pt' })}
                    className={`cursor-pointer ${locale === 'pt' ? 'bg-orange-100 text-orange-700' : ''}`}
                  >
                    Português
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4 space-y-4">
              <a href="#menu" className="block text-gray-700 hover:text-orange-600 transition-colors">{t('navMenu')}</a>
              <a href="#about" className="block text-gray-700 hover:text-orange-600 transition-colors">{t('navAbout')}</a>
              <a href="#contact" className="block text-gray-700 hover:text-orange-600 transition-colors">{t('navContact')}</a>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                {t('managerLogin')}
              </Button>
              <Button 
                onClick={handleReservation}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {t('makeReservationButton')}
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <Badge className="mb-6 bg-orange-500/20 text-orange-200 border-orange-300/30 animate-in fade-in-50 slide-in-from-top-4 duration-700">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('premiumExperienceBadge')}
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-in fade-in-50 slide-in-from-bottom-6 duration-700 delay-200">
            {t('heroTitlePart1')}
            <span className="block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {t('heroTitlePart2')}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-in fade-in-50 slide-in-from-bottom-6 duration-700 delay-400">
            {t('heroDescription')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in-50 slide-in-from-bottom-6 duration-700 delay-600">
            <Button 
              onClick={handleReservation}
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-orange-500/25 hover:scale-105 transition-all duration-300"
            >
              <Calendar className="w-5 h-5 mr-2" />
              {t('makeReservationButton')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg rounded-full"
            >
              <Menu className="w-5 h-5 mr-2" />
              {t('viewMenuButton')}
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
              {t('whyChooseUsBadge')}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('reservationsMadeTitlePart1')}
              <span className="block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {t('reservationsMadeTitlePart2')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('reservationsMadeDescription')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in-50 slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-100 text-red-800 border-red-200">
              <Heart className="w-4 h-4 mr-2" />
              {t('customerLoveBadge')}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('whatGuestsSayTitle')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-6 bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl border border-orange-100 animate-in fade-in-50 slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">{"\""}{testimonial.text}{"\""}</p>
                <p className="font-semibold text-gray-900">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('ctaDescription')}
          </p>
          <Button 
            onClick={handleReservation}
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <Calendar className="w-5 h-5 mr-2" />
            {t('reserveTableNowButton')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">{t('brandName')}</span>
              </div>
              <p className="text-gray-400">
                {t('footerDescription')}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('quickLinksTitle')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#menu" className="hover:text-white transition-colors">{t('navMenu')}</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">{t('aboutUsLink')}</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">{t('navContact')}</a></li>
                <li><a href="#reservations" className="hover:text-white transition-colors">{t('reservationsLink')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('contactInfoTitle')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('phone')}
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {t('email')}
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('address')}
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('hoursTitle')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t('hoursMonThu')}</li>
                <li>{t('hoursFriSat')}</li>
                <li>{t('hoursSunday')}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>{t('copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
