import { UserRole } from "../types/userRole";

const VALID_ROLES: UserRole[] = [
  "ADMINISTRADOR",
  "VETERINARIO",
  "ASISTENTE",
  "DUENO",
];

export const DEFAULT_PRIVATE_ROUTE = "/app/home";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USERNAME_KEY = "username";
const ROLE_KEY = "role";

export interface AuthSessionData {
  token: string;
  refreshToken?: string;
  username: string;
  role: string;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function normalizeUserRole(role: string | null): UserRole | null {
  if (!role) return null;

  return VALID_ROLES.includes(role as UserRole)
    ? (role as UserRole)
    : null;
}

export function getCurrentUserRole(): UserRole | null {
  return normalizeUserRole(localStorage.getItem(ROLE_KEY));
}

export function saveAuthSession(session: AuthSessionData) {
  localStorage.setItem(TOKEN_KEY, session.token);

  if (session.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  localStorage.setItem(USERNAME_KEY, session.username);

  const normalizedRole = normalizeUserRole(session.role);
  localStorage.setItem(ROLE_KEY, normalizedRole ?? session.role);
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken() && getCurrentUserRole());
}
