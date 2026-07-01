import {
  httpDeletePetAPI,
  httpGetPetAPI,
  httpPatchPetAPI,
  httpPostPetAPI,
  httpPutPetAPI,
} from "../api/petHttp";
import {
  CreatePetRequest,
  PetItem,
  PetResponse,
  UpdatePetRequest,
} from "../contracts/petContract";

export async function findAllPets() {
  const response: PetResponse = await httpGetPetAPI();
  return response.content ?? [];
}

export async function createPet(payload: CreatePetRequest) {
  const response: PetItem = await httpPostPetAPI(payload);
  return response;
}

export async function updatePet(id: number, payload: UpdatePetRequest) {
  const response: PetItem = await httpPutPetAPI(id, payload);
  return response;
}

export async function togglePetStatus(id: number) {
  const response: PetItem = await httpPatchPetAPI(id);
  return response;
}

export async function deletePet(id: number) {
  await httpDeletePetAPI(id);
}
