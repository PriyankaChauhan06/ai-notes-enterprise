let requestCount = 0;

const listeners = new Set<(isLoading: boolean) => void>();

export function subscribeLoading(listener: (isLoading: boolean) => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function startApiLoading() {
  requestCount += 1;

  listeners.forEach((listener) => listener(true));
}

export function stopApiLoading() {
  requestCount = Math.max(0, requestCount - 1);

  if (requestCount === 0) {
    listeners.forEach((listener) => listener(false));
  }
}
