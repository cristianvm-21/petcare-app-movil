import { AxiosError } from "axios";
import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/pageRequestContract";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserApiItem,
  UserApiResponse,
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

function normalizeUser(user: UserApiItem): UserItem {
  return {
    id: user.id,
    username: user.username ?? "",
    firstName: user.firstName ?? user.names ?? "",
    lastName: user.lastName ?? user.lastNames ?? "",
    email: user.email,
    phone: user.phone ?? "",
    role: user.role ?? user.rol ?? "ASISTENTE",
    active: user.active ?? false,
  };
}

export async function httpGetUserAPI(params?: GetUsersParams) {
  const response = await springbootApi.get<UserApiResponse>("usuarios", {
    params: {
      ...userPageRequest,
      ...params,
    },
  });

  return {
    ...response.data,
    content: (response.data.content ?? []).map(normalizeUser),
  } satisfies UserResponse;
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

  const responseData = response.data;

  if (Array.isArray(responseData)) {
    return responseData.map((user) => normalizeUser(user as UserApiItem));
  }

  return {
    ...responseData,
    content: (responseData.content ?? []).map((user) =>
      normalizeUser(user as UserApiItem),
    ),
  } satisfies UserResponse;
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
  const response = await springbootApi.post<UserApiItem>("usuarios", payload);
  return normalizeUser(response.data);
}

export async function httpPutUserLegacyAPI(
  id: number,
  payload: UpdateUserRequest,
) {
  const response = await springbootApi.put<UserApiItem>(`usuarios/${id}`, payload);
  return normalizeUser(response.data);
}

export async function httpPatchUserStatusAPI(
  id: number,
  payload: UpdateUserStatusRequest,
) {
  const response = await springbootApi.patch<UserApiItem>(
    `usuarios/${id}/estado`,
    payload,
  );
  return normalizeUser(response.data);
}

export async function httpDeleteUserLegacyAPI(id: number) {
  await springbootApi.delete(`usuarios/${id}`);
}
