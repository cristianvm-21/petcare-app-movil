/* => Aquí manejas qué hacer con el token */

import { loginRequest } from "../api/auth";
import { registerRequest } from "../api/auth";
import { RegisterRequest } from "../types/authType";

export async function login(username: string, password: string) {
    // response: Guarda un Objeto de tipo  LoginResponse
    const responseData = await loginRequest({ username, password });

    // Save Token en LocalStorage
    localStorage.setItem("token", responseData.token);
    localStorage.setItem("refreshToken", responseData.refreshToken);
    localStorage.setItem("username", responseData.username);
    localStorage.setItem("role", responseData.role);

    return responseData;
}

export async function signUp(registerData: RegisterRequest) {
    const responseData = await registerRequest(registerData);
    return responseData;
}
