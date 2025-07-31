"use client";

import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Spinner } from "./spinner";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, loading, loadingText, disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn("relative", className)}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-[inherit]">
            <Spinner size="sm" />
          </div>
        )}
        <span className={cn(loading && "invisible")}>
          {loading && loadingText ? loadingText : children}
        </span>
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";