/* => Aquí manejas qué hacer con el token */

import { normalizeUserRole } from "../auth/session";
import { loginRequest } from "../api/authHttp";
import { registerRequest } from "../api/authHttp";
import { RegisterRequest } from "../contracts/authContract";

export async function login(username: string, password: string) {
    // response: Guarda un Objeto de tipo  LoginResponse
    const responseData = await loginRequest({ username, password });

    // Save Token en LocalStorage
    localStorage.setItem("token", responseData.token);
    localStorage.setItem("refreshToken", responseData.refreshToken);
    localStorage.setItem("username", responseData.username);
    const normalizedRole = normalizeUserRole(responseData.role);
    localStorage.setItem("role", normalizedRole ?? responseData.role);

    return responseData;
}

export async function signUp(registerData: RegisterRequest) {
    const responseData = await registerRequest(registerData);
    return responseData;
}
