import { UserRole } from "../types/authType";

const ROLE_MAP: Record<string, UserRole> = {
  ADMINISTRADOR: "ADMINISTRADOR",
  VETERINARIO: "VETERINARIO",
  ASISTENTE: "ASISTENTE",
  DUENO: "DUENO",
  "DUEÑO": "DUENO",
};

export const DEFAULT_PRIVATE_ROUTE = "/app/home";

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function isAuthenticated() {
  return Boolean(getAuthToken() && getCurrentUserRole());
}

export function normalizeUserRole(role: string | null) {
  if (!role) {
    return null;
  }

  return ROLE_MAP[role] ?? null;
}

export function getCurrentUserRole() {
  return normalizeUserRole(localStorage.getItem("role"));
}
