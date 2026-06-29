// -- LOGIN
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken:string;
  username:string;
  role:string;
}

// -- REGISTRO
export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
}