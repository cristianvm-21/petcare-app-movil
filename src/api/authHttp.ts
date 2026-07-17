/* => Aquí solo haces la petición HTTP al backend. */
import { springbootApi } from "./axiosHttp";
import {
  AuthenticatedUserResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
} from "../contracts/authContract";

export async function loginRequest(credentials: LoginRequest) {
  const response = await springbootApi.post<LoginResponse>(
    "/auth/login",
    credentials,
  );
  return response.data;
}

export async function registerRequest(registerData:RegisterRequest) {
  const response = await springbootApi.post<RegisterResponse>("/auth/register",registerData)
  return response.data;
}

export async function refreshTokenRequest(payload?: RefreshTokenRequest) {
  const response = await springbootApi.post<RefreshTokenResponse>(
    "/auth/refresh",
    payload,
  );
  return response.data;
}

export async function logoutRequest() {
  await springbootApi.post("/auth/logout");
}

export async function getAuthenticatedUserRequest() {
  const response = await springbootApi.get<AuthenticatedUserResponse>("/auth/me");
  return response.data;
}
