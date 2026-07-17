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
  OwnerContactItem,
  OwnerContactsResponse,
  OwnerItem,
  OwnerResponse,
  UpdateOwnerRequest,
} from "../contracts/ownerContract";

function normalizeOwnerContacts(response: OwnerContactsResponse) {
  const items = Array.isArray(response) ? response : response.content ?? [];

  return items.map((contact) => ({
    id: contact.id,
    nombre: contact.nombre ?? "",
    telefono: contact.telefono ?? "",
    relacion: contact.relacion ?? "",
  }));
}

export async function findAllOwners(filters?: {
  soloActivos?: boolean;
  nombre?: string;
  dni?: string;
}) {
  const response: OwnerResponse = await httpGetOwnerAPI(filters);
  return response.content ?? [];
}

export async function findOwnerById(id: number) {
  const response: OwnerItem = await httpGetOwnerByIdAPI(id);
  return response;
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
  const response: OwnerItem = await httpPostOwnerAPI(payload);
  return response;
}

export async function updateOwner(id: number, payload: UpdateOwnerRequest) {
  const response: OwnerItem = await httpPutOwnerAPI(id, payload);
  return response;
}

export async function createOwnerContact(
  id: number,
  payload: CreateOwnerContactRequest,
) {
  const response: OwnerContactItem = await httpPostOwnerContactAPI(id, payload);
  return {
    id: response.id,
    nombre: response.nombre ?? payload.name,
    telefono: response.telefono ?? payload.phone,
    relacion: response.relacion ?? payload.relation,
  };
}

export async function toggleOwnerStatus(id: number) {
  const response: OwnerItem = await httpPatchOwnerAPI(id);
  return response;
}

export async function deleteOwner(id: number) {
  await httpDeleteOwnerAPI(id);
}

export async function deleteOwnerContact(contactId: number) {
  await httpDeleteOwnerContactAPI(contactId);
}
