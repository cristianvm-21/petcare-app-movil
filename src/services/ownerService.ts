import {
  httpDeleteOwnerAPI,
  httpDeleteOwnerContactsAPI,
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

export async function findAllOwners() {
  const response: OwnerResponse = await httpGetOwnerAPI();
  return response.content ?? [];
}

export async function findOwnerById(id: number) {
  const response: OwnerItem = await httpGetOwnerByIdAPI(id);
  return response;
}

export async function findOwnerContacts(id: number) {
  const response: OwnerContactsResponse = await httpGetOwnerContactsAPI(id);
  return response ?? [];
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
  return response;
}

export async function toggleOwnerStatus(id: number) {
  const response: OwnerItem = await httpPatchOwnerAPI(id);
  return response;
}

export async function deleteOwner(id: number) {
  await httpDeleteOwnerAPI(id);
}

export async function deleteOwnerContacts(id: number) {
  await httpDeleteOwnerContactsAPI(id);
}
