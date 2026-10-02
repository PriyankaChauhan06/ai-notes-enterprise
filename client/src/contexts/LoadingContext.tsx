import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface LoadingContextValue {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(
  undefined,
);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [requestCount, setRequestCount] = useState(0);

  const startLoading = useCallback(() => {
    setRequestCount((count) => count + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setRequestCount((count) => Math.max(0, count - 1));
  }, []);

  const value = useMemo(
    () => ({
      isLoading: requestCount > 0,
      startLoading,
      stopLoading,
    }),
    [requestCount, startLoading, stopLoading],
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoading must be used inside LoadingProvider");
  }

  return context;
}
