import { useEffect, useState } from "react";
import { subscribeLoading } from "../utils/loading-events";

export function useApiLoading() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return subscribeLoading(setIsLoading);
  }, []);

  return isLoading;
}
