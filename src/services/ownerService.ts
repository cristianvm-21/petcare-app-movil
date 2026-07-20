import {
  httpDeleteOwnerAPI,
  httpDeleteOwnerContactAPI,
  httpGetOwnerAPI,
  httpGetOwnerByIdAPI,
  httpGetOwnerContactsAPI,
  httpPatchOwnerAPI,
  httpPostOwnerAPI,
  httpPostOwnerContactAPI,
  httpPutOwnerAPI,
} from "../api/ownerHttp";
import {
  CreateOwnerContactRequest,
  CreateOwnerRequest,
  OwnerApiItem,
  OwnerApiResponse,
  OwnerApiUserItem,
  OwnerContactApiItem,
  OwnerContactItem,
  OwnerContactsResponse,
  OwnerItem,
  UpdateOwnerRequest,
} from "../contracts/ownerContract";

function normalizeOwnerUser(user?: OwnerApiUserItem | null) {
  if (!user) {
    return undefined;
  }

  return {
    id: user.id,
    nombre: user.nombre ?? user.names ?? "",
    apellido: user.apellido ?? user.lastNames ?? "",
    email: user.email ?? "",
    telefono: user.telefono ?? user.phone ?? "",
    rol: user.rol ?? "",
    activo: user.activo ?? user.active ?? true,
  };
}

function normalizeOwner(owner: OwnerApiItem): OwnerItem {
  const normalizedUser = normalizeOwnerUser(owner.usuario);

  return {
    id: owner.id,
    nombre: owner.nombre ?? normalizedUser?.nombre ?? "",
    apellido: owner.apellido ?? normalizedUser?.apellido ?? "",
    dni: owner.dni,
    email: owner.email ?? normalizedUser?.email ?? "",
    telefono: owner.telefono ?? owner.phone ?? normalizedUser?.telefono ?? "",
    direccion: owner.direccion ?? owner.address ?? "",
    usuario: normalizedUser,
    activo: owner.activo ?? owner.active ?? normalizedUser?.activo ?? true,
  };
}

function normalizeOwnerContacts(response: OwnerContactsResponse) {
  const items = Array.isArray(response) ? response : response.content ?? [];

  return items.map((contact: OwnerContactApiItem) => ({
    id: contact.id,
    nombre: contact.nombre ?? contact.name ?? "",
    telefono: contact.telefono ?? contact.phone ?? "",
    relacion: contact.relacion ?? contact.relation ?? "",
  }));
}

export async function findAllOwners(filters?: {
  soloActivos?: boolean;
  nombre?: string;
  dni?: string;
}) {
  const response: OwnerApiResponse = await httpGetOwnerAPI(filters);
  return (response.content ?? []).map(normalizeOwner);
}

export async function findOwnerById(id: number) {
  const response: OwnerApiItem = await httpGetOwnerByIdAPI(id);
  return normalizeOwner(response);
}

export async function findOwnerContacts(
  id: number,
  filters?: {
    nombre?: string;
    telefono?: string;
    relacion?: string;
  },
) {
  const response: OwnerContactsResponse = await httpGetOwnerContactsAPI(
    id,
    filters,
  );
  return normalizeOwnerContacts(response);
}

export async function createOwner(payload: CreateOwnerRequest) {
  const response: OwnerApiItem = await httpPostOwnerAPI(payload);
  return normalizeOwner(response);
}

export async function updateOwner(id: number, payload: UpdateOwnerRequest) {
  const response: OwnerApiItem = await httpPutOwnerAPI(id, payload);
  return normalizeOwner(response);
}

export async function createOwnerContact(
  id: number,
  payload: CreateOwnerContactRequest,
) {
  const response: OwnerContactApiItem = await httpPostOwnerContactAPI(id, payload);
  return {
    id: response.id,
    nombre: response.nombre ?? response.name ?? payload.name,
    telefono: response.telefono ?? response.phone ?? payload.phone,
    relacion: response.relacion ?? response.relation ?? payload.relation,
  };
}

export async function toggleOwnerStatus(id: number) {
  const response: OwnerApiItem = await httpPatchOwnerAPI(id);
  return normalizeOwner(response);
}

export async function deleteOwner(id: number) {
  await httpDeleteOwnerAPI(id);
}

export async function deleteOwnerContact(contactId: number) {
  await httpDeleteOwnerContactAPI(contactId);
}
