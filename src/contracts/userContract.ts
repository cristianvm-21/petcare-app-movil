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

export interface UpdateUserStatusRequest {
  active: boolean;
}
