import { UserRole } from "../types/userRole";

export interface UserItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
}

export interface CreateUserRequest {
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole | "";
}

export type UpdateUserRequest = CreateUserRequest;

export interface UserPageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface UserResponse {
  content: UserItem[];
  page?: UserPageInfo;
}

export type UserListResponse = UserResponse | UserItem[];

export interface UserApiItem {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: UserRole;
  active?: boolean;
  names?: string;
  lastNames?: string;
  rol?: UserRole;
}

export interface UserApiResponse {
  content: UserApiItem[];
  page?: UserPageInfo;
}

export interface UpdateUserStatusRequest {
  active: boolean;
}
