import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/pageRequestContract";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserItem,
  UserResponse,
  VeterinarianResponse,
} from "../contracts/userContract";
import { UserRole } from "../types/userRole";

const userPageRequest: PageRequest = {
  page: 0,
  size: 100,
};

interface GetUsersParams extends Partial<PageRequest> {
  soloActivos?: boolean;
  rol?: UserRole;
}

export async function httpGetUserAPI(params?: GetUsersParams) {
  const response = await springbootApi.get<UserResponse>("usuarios", {
    params: {
      ...userPageRequest,
      ...params,
    },
  });
  return response.data;
}

export async function httpGetVeterinariansAPI() {
  const response = await springbootApi.get<VeterinarianResponse>(
    "usuarios/veterinarios",
  );
  return response.data;
}

export async function httpPostUserAPI(payload: CreateUserRequest) {
  const response = await springbootApi.post<UserItem>("usuarios", payload);
  return response.data;
}

export async function httpPutUserAPI(id: number, payload: UpdateUserRequest) {
  const response = await springbootApi.put<UserItem>(`usuarios/${id}`, payload);
  return response.data;
}

export async function httpPatchUserAPI(id: number) {
  const response = await springbootApi.patch<UserItem>(`usuarios/${id}/toggle`);
  return response.data;
}

export async function httpDeleteUserAPI(id: number) {
  await springbootApi.delete(`usuarios/${id}`);
}
