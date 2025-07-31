import { useState, useCallback } from "react";

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  const withLoading = useCallback(
    async <T,>(asyncFunction: () => Promise<T>): Promise<T | undefined> => {
      try {
        startLoading();
        return await asyncFunction();
      } catch (error) {
        console.error("Error in withLoading:", error);
        throw error;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}