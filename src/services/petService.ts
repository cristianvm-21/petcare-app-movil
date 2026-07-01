import {
  httpDeletePetAPI,
  httpGetPetAPI,
  httpGetPetByIdAPI,
  httpGetPetOwnerPrincipalAPI,
  httpGetPetsByOwnerIdAPI,
  httpPatchPetAPI,
  httpPostPetAPI,
  httpPutPetAPI,
} from "../api/petHttp";
import {
  CreatePetRequest,
  PetItem,
  PetOwnerPrincipalResponse,
  PetsByOwnerResponse,
  PetResponse,
  UpdatePetRequest,
} from "../contracts/petContract";
import { OwnerItem } from "../contracts/ownerContract";

function normalizePetsResponse(response: PetsByOwnerResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  return response.content ?? [];
}

export async function findAllPets() {
  const response: PetResponse = await httpGetPetAPI();
  return response.content ?? [];
}

export async function findPetById(id: number) {
  const response: PetItem = await httpGetPetByIdAPI(id);
  return response;
}

export async function findPetsByOwnerId(ownerId: number) {
  const response: PetsByOwnerResponse = await httpGetPetsByOwnerIdAPI(ownerId);
  return normalizePetsResponse(response);
}

export async function findPetOwnerPrincipal(id: number) {
  const response: PetOwnerPrincipalResponse = await httpGetPetOwnerPrincipalAPI(id);
  return response as OwnerItem;
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
