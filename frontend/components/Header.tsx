'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Calendar, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  adminName?: string;
}

export default function Header({ adminName = 'Admin' }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navigationItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Calendar,
      description: 'View daily reservations and table status'
    },
    {
      href: '/tables',
      label: 'Tables',
      icon: Settings,
      description: 'Manage restaurant tables and layout'
    }
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsSheetOpen(false);
  };

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:inline-block">
                RestaurantAdmin
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Button
                  key={item.href}
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    relative h-9 px-4 rounded-lg transition-all duration-200
                    ${active 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-900 rounded-full" />
                  )}
                </Button>
              );
            })}
          </nav>

          {/* User Info & Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* User Badge */}
            <Badge variant="secondary" className="hidden sm:inline-flex bg-gray-100 text-gray-700 hover:bg-gray-200">
              {adminName}
            </Badge>

            {/* Mobile Menu */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center space-x-2 pb-6 border-b">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">R</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">RestaurantAdmin</p>
                      <p className="text-sm text-gray-500">{adminName}</p>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 pt-6">
                    <div className="space-y-2">
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        
                        return (
                          <button
                            key={item.href}
                            onClick={() => handleNavigation(item.href)}
                            className={`
                              w-full flex items-start space-x-3 px-3 py-3 rounded-lg text-left transition-colors
                              ${active 
                                ? 'bg-gray-900 text-white' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }
                            `}
                          >
                            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{item.label}</p>
                              <p className={`text-sm ${active ? 'text-gray-300' : 'text-gray-500'}`}>
                                {item.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </nav>

                  {/* Mobile Footer */}
                  <div className="pt-6 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-gray-600 hover:text-gray-900"
                      onClick={() => {
                        // Handle logout logic here
                        console.log('Logout clicked');
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}