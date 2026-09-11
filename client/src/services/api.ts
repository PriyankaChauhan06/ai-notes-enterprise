import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { notifyAuthLogout } from "../utils/auth-events";
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  removeStoredUser,
} from "../utils/auth-storage";

type AuthRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AuthRequestConfig;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?._skipAuthRefresh
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await axios.post<{
        success: boolean;
        data: {
          accessToken: string;
        };
      }>(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
        },
      );

      const newAccessToken = response.data.data.accessToken;

      setAccessToken(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      removeAccessToken();
      removeStoredUser();
      notifyAuthLogout();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
