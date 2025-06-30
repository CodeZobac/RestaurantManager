'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function MapsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Maps');
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Maps page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">
            {t('error')}
          </CardTitle>
          <CardDescription>
            {t('mapLoadError')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>Something went wrong while loading the restaurant map.</p>
            {error.message && (
              <p className="mt-2 font-mono text-xs bg-muted p-2 rounded">
                {error.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('retry')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              {t('backToHome')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
