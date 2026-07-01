import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/pageRequestContract";
import {
  CreateOwnerContactRequest,
  CreateOwnerRequest,
  OwnerContactItem,
  OwnerContactsResponse,
  OwnerItem,
  OwnerResponse,
  UpdateOwnerRequest,
} from "../contracts/ownerContract";

const ownerPageRequest: PageRequest = {
  page: 0,
  size: 100,
};

export async function httpGetOwnerAPI() {
  const response = await springbootApi.get<OwnerResponse>("duenos", {
    params: ownerPageRequest,
  });
  return response.data;
}

export async function httpGetOwnerByIdAPI(id: number) {
  const response = await springbootApi.get<OwnerItem>(`duenos/${id}`);
  return response.data;
}

export async function httpGetOwnerContactsAPI(id: number) {
  const response = await springbootApi.get<OwnerContactsResponse>(
    `duenos/${id}/contactos`,
  );
  return response.data;
}

export async function httpPostOwnerAPI(payload: CreateOwnerRequest) {
  const response = await springbootApi.post<OwnerItem>("duenos", payload);
  return response.data;
}

export async function httpPostOwnerContactAPI(
  id: number,
  payload: CreateOwnerContactRequest,
) {
  const response = await springbootApi.post<OwnerContactItem>(
    `duenos/${id}/contactos`,
    payload,
  );
  return response.data;
}

export async function httpPutOwnerAPI(
  id: number,
  payload: UpdateOwnerRequest,
) {
  const response = await springbootApi.put<OwnerItem>(`duenos/${id}`, payload);
  return response.data;
}

export async function httpPatchOwnerAPI(id: number) {
  const response = await springbootApi.patch<OwnerItem>(`duenos/${id}/toggle`);
  return response.data;
}

export async function httpDeleteOwnerAPI(id: number) {
  await springbootApi.delete(`duenos/${id}`);
}

export async function httpDeleteOwnerContactsAPI(id: number) {
  await springbootApi.delete(`duenos/${id}/contactos`);
}
