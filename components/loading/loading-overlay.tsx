import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

interface LoadingOverlayProps {
  className?: string;
  fullScreen?: boolean;
  message?: string;
}

export function LoadingOverlay({ 
  className, 
  fullScreen = false,
  message 
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background/80 backdrop-blur-sm",
        fullScreen ? "fixed inset-0 z-50" : "absolute inset-0 z-10",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}