'use client'

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon } from 'lucide-react';

export default function ReserveError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Reservation page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangleIcon className="h-12 w-12 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              We encountered an error while loading the reservation form. Please try again.
            </p>
            
            <div className="space-x-4">
              <Button onClick={reset}>
                Try again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
              >
                Go home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
