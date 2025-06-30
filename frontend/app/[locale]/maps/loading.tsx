import { Skeleton } from '@/components/ui/skeleton';

export default function MapsLoading() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Header skeleton */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-background border-b">
        <div className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="pt-[72px] h-full flex">
        {/* Sidebar skeleton */}
        <div className="w-80 bg-background border-r p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg border">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map skeleton */}
        <div className="flex-1 bg-muted/20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-32 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
