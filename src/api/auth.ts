/* => Aquí solo haces la petición HTTP al backend. */
import { springbootApi } from "./axiosHttp";
import { LoginRequest, LoginResponse } from "../types/authType";
import { RegisterRequest, RegisterResponse } from "../types/authType";

// LOGIN
export async function loginRequest(credentials:LoginRequest) {
    const response = await springbootApi.post<LoginResponse>("/auth/login", credentials);
    return response.data;
}

// REGISTRO
export async function registerRequest(registerData:RegisterRequest) {
  const response = await springbootApi.post<RegisterResponse>("/auth/register",registerData)
  return response.data;
}