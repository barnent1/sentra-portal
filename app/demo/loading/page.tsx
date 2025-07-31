"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout";
import {
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  Spinner,
  LoadingOverlay,
  LoadingButton,
} from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useLoading } from "@/hooks/use-loading";

export default function LoadingDemoPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const { isLoading, withLoading } = useLoading();

  const handleAsyncAction = async () => {
    await withLoading(async () => {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });
  };

  return (
    <AppLayout>
      <div className="relative">
        {showOverlay && (
          <LoadingOverlay message="Processing your request..." />
        )}

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Loading States Demo</h1>
            <p className="text-muted-foreground">
              Showcase of various loading components and skeleton screens
            </p>
          </div>

          {/* Spinners */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Spinners</h2>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <Spinner size="sm" />
                <p className="text-sm text-muted-foreground mt-2">Small</p>
              </div>
              <div className="text-center">
                <Spinner size="md" />
                <p className="text-sm text-muted-foreground mt-2">Medium</p>
              </div>
              <div className="text-center">
                <Spinner size="lg" />
                <p className="text-sm text-muted-foreground mt-2">Large</p>
              </div>
            </div>
          </section>

          {/* Loading Button */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Loading Button</h2>
            <div className="flex items-center space-x-4">
              <LoadingButton onClick={handleAsyncAction} loading={isLoading}>
                Click to Load
              </LoadingButton>
              <LoadingButton loading={true} loadingText="Processing...">
                Always Loading
              </LoadingButton>
            </div>
          </section>

          {/* Card Skeleton */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Card Skeleton</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton showImage />
              <CardSkeleton />
            </div>
          </section>

          {/* Table Skeleton */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Table Skeleton</h2>
            <TableSkeleton rows={3} columns={5} />
          </section>

          {/* Form Skeleton */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Form Skeleton</h2>
            <div className="max-w-md">
              <FormSkeleton fields={3} />
            </div>
          </section>

          {/* Loading Overlay */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Loading Overlay</h2>
            <Button onClick={() => setShowOverlay(!showOverlay)}>
              Toggle Overlay
            </Button>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}