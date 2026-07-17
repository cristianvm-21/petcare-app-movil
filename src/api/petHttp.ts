import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/pageRequestContract";
import {
  CreatePetRequest,
  GetPetsFilters,
  PetItem,
  PetOwnerPrincipalResponse,
  PetsByOwnerResponse,
  PetResponse,
  UpdatePetRequest,
} from "../contracts/petContract";

const petPageRequest: PageRequest = {
  page: 0,
  size: 100,
};

type GetPetsParams = Partial<PageRequest> & GetPetsFilters;

export async function httpGetPetAPI(params?: GetPetsParams) {
  const response = await springbootApi.get<PetResponse>("mascotas", {
    params: {
      ...petPageRequest,
      ...params,
    },
  });
  return response.data;
}

export async function httpGetPetByIdAPI(id: number) {
  const response = await springbootApi.get<PetItem>(`mascotas/${id}`);
  return response.data;
}

export async function httpGetPetsByOwnerIdAPI(
  ownerId: number,
  params?: Partial<PageRequest>,
) {
  const response = await springbootApi.get<PetsByOwnerResponse>(
    `mascotas/dueno/${ownerId}`,
    {
      params: {
        ...petPageRequest,
        ...params,
      },
    },
  );
  return response.data;
}

export async function httpGetPetOwnerPrincipalAPI(id: number) {
  const response = await springbootApi.get<PetOwnerPrincipalResponse>(
    `mascotas/${id}/dueno-principal`,
  );
  return response.data;
}

export async function httpPostPetAPI(payload: CreatePetRequest) {
  const response = await springbootApi.post<PetItem>("mascotas", payload);
  return response.data;
}

export async function httpPutPetAPI(id: number, payload: UpdatePetRequest) {
  const response = await springbootApi.put<PetItem>(`mascotas/${id}`, payload);
  return response.data;
}

export async function httpPatchPetAPI(id: number) {
  const response = await springbootApi.patch<PetItem>(`mascotas/${id}/toggle`);
  return response.data;
}

export async function httpDeletePetAPI(id: number) {
  await springbootApi.delete(`mascotas/${id}`);
}
