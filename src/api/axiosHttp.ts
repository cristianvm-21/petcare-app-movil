import axios from "axios";
import {
  clearAuthSession,
  getAuthToken,
  getRefreshToken,
  saveAuthSession,
} from "../auth/session";
import { API_BASE_URL } from "../config/apiConfig";

const authRefreshApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RetryableRequestConfig {
  headers?: Record<string, string>;
  _retry?: boolean;
}

function shouldSkipRefresh(url?: string) {
  return (
    url?.includes("/auth/login") ||
    url?.includes("/auth/register") ||
    url?.includes("/auth/refresh") ||
    url?.includes("/auth/logout")
  );
}

export const springbootApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

springbootApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

springbootApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(error.config?.url)
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        const refreshResponse = await authRefreshApi.post("/auth/refresh", {
          refreshToken: refreshToken ?? undefined,
        });

        saveAuthSession(refreshResponse.data);

        const nextToken = getAuthToken();

        if (nextToken) {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: nextToken.startsWith("Bearer ")
              ? nextToken
              : `Bearer ${nextToken}`,
          };
        }

        return springbootApi(originalRequest);
      } catch (refreshError) {
        clearAuthSession();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      clearAuthSession();
    }

    return Promise.reject(error);
  },
);
