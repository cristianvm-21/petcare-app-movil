import { UserRole } from "../types/userRole";

export interface UserItem {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole | "";
}

export type UpdateUserRequest = CreateUserRequest;

export interface UserResponse {
  content: UserItem[];
}

export type VeterinarianResponse = UserItem[];
