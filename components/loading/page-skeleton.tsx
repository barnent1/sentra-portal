import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  className?: string;
  showSidebar?: boolean;
}

export function PageSkeleton({ className, showSidebar = false }: PageSkeletonProps) {
  return (
    <div className={cn("min-h-screen", className)}>
      {/* Header */}
      <div className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-9 w-64 hidden md:block" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 border-r hidden md:block">
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1">
          <div className="container py-6">
            {/* Page header */}
            <div className="mb-8">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Content */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}