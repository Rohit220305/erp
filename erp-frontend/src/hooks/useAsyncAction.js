import { useState, useCallback } from "react";

export function useAsyncAction(minDurationMs = 1500) {
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (asyncFn) => {
    setIsLoading(true);
    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, minDurationMs));
      const [result] = await Promise.all([asyncFn(), minDelay]);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [minDurationMs]);

  return { execute, isLoading };
}
