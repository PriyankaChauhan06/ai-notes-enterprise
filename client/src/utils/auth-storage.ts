const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function setStoredUser(user: unknown) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser<T>() {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as T;
  } catch {
    return null;
  }
}

export function removeStoredUser() {
  localStorage.removeItem(USER_KEY);
}

export function clearLS() {
  localStorage.clear();
}
