import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className 
}: TableSkeletonProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center border-b p-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-${i}`} className="flex-1">
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex items-center border-b p-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1">
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}