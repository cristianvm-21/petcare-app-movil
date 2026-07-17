import { AxiosError } from "axios";
import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/pageRequestContract";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserItem,
  UserListResponse,
  UserResponse,
} from "../contracts/userContract";
import { UserRole } from "../types/userRole";

const userPageRequest: PageRequest = {
  page: 0,
  size: 100,
};

export interface GetUsersParams extends Partial<PageRequest> {
  soloActivos?: boolean;
  rol?: UserRole;
}

export interface UserCollectionResult {
  items: UserItem[];
  source: "general" | "veterinarians";
  supportsFullCrud: boolean;
}

function isMissingRouteError(error: unknown) {
  return (
    error instanceof AxiosError &&
    [404, 405, 501].includes(error.response?.status ?? 0)
  );
}

function normalizeUserListResponse(response: UserListResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  return response.content ?? [];
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

export async function httpGetVeterinariansAPI(options?: {
  includeInactive?: boolean;
  page?: number;
  size?: number;
}) {
  const path = options?.includeInactive
    ? "usuarios/veterinarios/todos"
    : "usuarios/veterinarios";

  const response = await springbootApi.get<UserListResponse>(path, {
    params: {
      ...userPageRequest,
      page: options?.page ?? userPageRequest.page,
      size: options?.size ?? userPageRequest.size,
    },
  });

  return response.data;
}

export async function httpGetUsersCatalogAPI(
  params?: GetUsersParams,
): Promise<UserCollectionResult> {
  try {
    const response = await httpGetUserAPI(params);
    return {
      items: normalizeUserListResponse(response),
      source: "general",
      supportsFullCrud: true,
    };
  } catch (error) {
    const onlyVeterinarians =
      !params?.rol || params.rol === "VETERINARIO";

    if (!isMissingRouteError(error) || !onlyVeterinarians) {
      throw error;
    }

    const veterinarianResponse = await httpGetVeterinariansAPI({
      includeInactive: !params?.soloActivos,
      page: params?.page,
      size: params?.size,
    });

    return {
      items: normalizeUserListResponse(veterinarianResponse),
      source: "veterinarians",
      supportsFullCrud: false,
    };
  }
}

export async function httpPostUserAPI(payload: CreateUserRequest) {
  const response = await springbootApi.post<UserItem>("usuarios", payload);
  return response.data;
}

export async function httpPutUserLegacyAPI(
  id: number,
  payload: UpdateUserRequest,
) {
  const response = await springbootApi.put<UserItem>(`usuarios/${id}`, payload);
  return response.data;
}

export async function httpPatchUserStatusAPI(
  id: number,
  payload: UpdateUserStatusRequest,
) {
  const response = await springbootApi.patch<UserItem>(
    `usuarios/${id}/estado`,
    payload,
  );
  return response.data;
}

export async function httpDeleteUserLegacyAPI(id: number) {
  await springbootApi.delete(`usuarios/${id}`);
}
