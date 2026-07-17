import {
  clearAuthSession,
  getRefreshToken,
  saveAuthSession,
} from "../auth/session";
import {
  getAuthenticatedUserRequest,
  loginRequest,
  logoutRequest,
  refreshTokenRequest,
  registerRequest,
} from "../api/authHttp";
import {
  RefreshTokenResponse,
  RegisterRequest,
} from "../contracts/authContract";

export async function login(email: string, password: string) {
  const responseData = await loginRequest({ email, password });
  saveAuthSession(responseData);
  return responseData;
}

export async function signUp(registerData: RegisterRequest) {
  const responseData = await registerRequest(registerData);
  return responseData;
}

export async function refreshAuthSession() {
  const refreshToken = getRefreshToken();
  const responseData: RefreshTokenResponse = await refreshTokenRequest(
    refreshToken ? { refreshToken } : undefined,
  );

  saveAuthSession(responseData);
  return responseData;
}

export async function logout() {
  try {
    await logoutRequest();
  } finally {
    clearAuthSession();
  }
}

export async function getAuthenticatedUser() {
  const responseData = await getAuthenticatedUserRequest();
  return responseData;
}
