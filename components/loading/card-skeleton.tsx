import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  className?: string;
  showImage?: boolean;
}

export function CardSkeleton({ className, showImage = false }: CardSkeletonProps) {
  return (
    <div className={cn("rounded-lg border p-6", className)}>
      {showImage && <Skeleton className="h-48 w-full rounded-md mb-4" />}
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-5/6 mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}