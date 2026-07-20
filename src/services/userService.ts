import { AxiosError } from "axios";
import {
  httpDeleteUserLegacyAPI,
  httpGetUsersCatalogAPI,
  httpPatchUserStatusAPI,
  httpPostUserAPI,
  httpPutUserLegacyAPI,
  UserCollectionResult,
} from "../api/userHttp";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserItem,
} from "../contracts/userContract";
import { UserRole } from "../types/userRole";

export interface UsersCatalogResult {
  items: UserItem[];
  source: UserCollectionResult["source"];
  supportsFullCrud: boolean;
}

function isLegacyRouteUnavailable(error: unknown) {
  return (
    error instanceof AxiosError &&
    [404, 405, 501].includes(error.response?.status ?? 0)
  );
}

export async function findUsersCatalog(filters?: {
  soloActivos?: boolean;
  rol?: UserRole;
}) {
  const response = await httpGetUsersCatalogAPI(filters);

  return {
    items: response.items,
    source: response.source,
    supportsFullCrud: response.supportsFullCrud,
  } satisfies UsersCatalogResult;
}

export async function findAllUsers() {
  const response = await findUsersCatalog();
  return response.items;
}

export async function findUsersByFilters(filters: {
  soloActivos?: boolean;
  rol?: UserRole;
}) {
  const response = await findUsersCatalog(filters);
  return response.items;
}

export async function findVeterinarians(options?: { includeInactive?: boolean }) {
  const response = await findUsersCatalog({
    soloActivos: options?.includeInactive ? undefined : true,
    rol: "VETERINARIO",
  });

  return response.items.filter((user) => user.role === "VETERINARIO");
}

export async function createUser(payload: CreateUserRequest) {
  const response: UserItem = await httpPostUserAPI(payload);
  return response;
}

export async function updateUser(id: number, payload: UpdateUserRequest) {
  try {
    const response: UserItem = await httpPutUserLegacyAPI(id, payload);
    return response;
  } catch (error) {
    if (isLegacyRouteUnavailable(error)) {
      throw new Error(
        "El backend actual no expone la edición completa de usuarios.",
      );
    }

    throw error;
  }
}

export async function toggleUserStatus(user: UserItem) {
  const response: UserItem = await httpPatchUserStatusAPI(user.id, {
    active: !user.active,
  });
  return response;
}

export async function deleteUser(id: number) {
  try {
    await httpDeleteUserLegacyAPI(id);
  } catch (error) {
    if (isLegacyRouteUnavailable(error)) {
      throw new Error(
        "El backend actual no expone la eliminación de usuarios.",
      );
    }

    throw error;
  }
}
