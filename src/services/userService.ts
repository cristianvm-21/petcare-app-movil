import {
  httpDeleteUserAPI,
  httpGetUserAPI,
  httpGetVeterinariansAPI,
  httpPatchUserAPI,
  httpPostUserAPI,
  httpPutUserAPI,
} from "../api/userHttp";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserItem,
  UserResponse,
  VeterinarianResponse,
} from "../contracts/userContract";
import { UserRole } from "../types/userRole";

export async function findAllUsers() {
  const response: UserResponse = await httpGetUserAPI();
  return response.content ?? [];
}

export async function findUsersByFilters(filters: {
  soloActivos?: boolean;
  rol?: UserRole;
}) {
  const response: UserResponse = await httpGetUserAPI(filters);
  return response.content ?? [];
}

export async function findVeterinarians() {
  const response: VeterinarianResponse = await httpGetVeterinariansAPI();
  return response ?? [];
}

export async function createUser(payload: CreateUserRequest) {
  const response: UserItem = await httpPostUserAPI(payload);
  return response;
}

export async function updateUser(id: number, payload: UpdateUserRequest) {
  const response: UserItem = await httpPutUserAPI(id, payload);
  return response;
}

export async function toggleUserStatus(id: number) {
  const response: UserItem = await httpPatchUserAPI(id);
  return response;
}

export async function deleteUser(id: number) {
  await httpDeleteUserAPI(id);
}
