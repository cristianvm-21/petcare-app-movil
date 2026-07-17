const DEFAULT_API_BASE_URL =
  "http://localhost:8080/api";

function normalizeApiBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
);
