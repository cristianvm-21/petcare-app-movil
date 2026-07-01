import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/pageRequestContract";
import {
  CreatePetRequest,
  PetItem,
  PetResponse,
  UpdatePetRequest,
} from "../contracts/petContract";

const petPageRequest: PageRequest = {
  page: 0,
  size: 100,
};

export async function httpGetPetAPI() {
  const response = await springbootApi.get<PetResponse>("mascotas", {
    params: petPageRequest,
  });
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
