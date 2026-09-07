import { useEffect, useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (!storedValue) return initialValue;

      return JSON.parse(storedValue) as T;
    } catch (error) {
      console.error(`Failed to read localStorage key "${key}":`, error);

      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to write localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalStorage;
