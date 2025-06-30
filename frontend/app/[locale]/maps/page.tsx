import { setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { BackButton } from './components/back-button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Find Our Restaurants - The Golden Spoon",
  description: "Explore all of our locations on the map and find the one closest to you.",
};

interface Props {
  params: Promise<{ locale: string }>;
}

// Dynamic import for client components
const MapsClientComponents = dynamic(() => import('./components/maps-client'), {
  loading: () => (
    <div className="relative h-screen w-full bg-muted/20">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Simplified loading skeleton */}
          <div className="animate-pulse bg-gray-300 h-8 w-32 mx-auto rounded" />
          <div className="animate-pulse bg-gray-300 h-4 w-48 mx-auto rounded" />
        </div>
      </div>
    </div>
  ),
});

export default async function MapsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Back button only - positioned absolutely at top */}
      <div className="absolute top-4 left-4 z-50">
        <BackButton />
      </div>

      {/* Map and sidebar container - full height */}
      <div className="h-full">
        <MapsClientComponents />
      </div>
    </div>
  );
}
