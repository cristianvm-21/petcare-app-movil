import { UserRole } from "../types/userRole";

const VALID_ROLES: UserRole[] = [
  "ADMINISTRADOR",
  "VETERINARIO",
  "ASISTENTE",
  "DUENO",
];

export const DEFAULT_PRIVATE_ROUTE = "/app/home";

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

export function normalizeUserRole(role: string | null): UserRole | null {
  if (!role) return null;

  return VALID_ROLES.includes(role as UserRole)
    ? (role as UserRole)
    : null;
}

export function getCurrentUserRole(): UserRole | null {
  return normalizeUserRole(localStorage.getItem("role"));
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken() && getCurrentUserRole());
}
