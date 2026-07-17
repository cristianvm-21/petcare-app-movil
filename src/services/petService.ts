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
  GetPetsFilters,
  PetApiItem,
  PetApiResponse,
  PetItem,
  PetOwnerPrincipalResponse,
  PetsByOwnerResponse,
  UpdatePetRequest,
} from "../contracts/petContract";
import { OwnerItem } from "../contracts/ownerContract";

function normalizePet(pet: PetApiItem): PetItem {
  return {
    id: pet.id,
    nombre: pet.nombre ?? pet.name ?? "",
    especie: pet.especie ?? "",
    raza: pet.raza ?? pet.breed ?? "",
    sexo: pet.sexo ?? pet.gender ?? "",
    fechaNacimiento: pet.fechaNacimiento ?? pet.dateOfBirth ?? "",
    microchip: pet.microchip ?? "",
    condicionReproductiva:
      pet.condicionReproductiva ?? pet.reproductiveCondition ?? "",
    alergias: pet.alergias ?? pet.allergies ?? "",
    enfermedadesCronicas:
      pet.enfermedadesCronicas ?? pet.chronicDiseases ?? "",
    alertasMedicas: pet.alertasMedicas ?? pet.medicalAlerts ?? "",
    activo: pet.activo ?? pet.active ?? false,
  };
}

function normalizePetsResponse(response: PetApiResponse | PetsByOwnerResponse) {
  return (response.content ?? []).map((pet) => normalizePet(pet as PetApiItem));
}

export async function findAllPets(filters?: GetPetsFilters) {
  const response: PetApiResponse = await httpGetPetAPI(filters);
  return normalizePetsResponse(response);
}

export async function findPetById(id: number) {
  const response: PetApiItem = await httpGetPetByIdAPI(id);
  return normalizePet(response);
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
  const response: PetApiItem = await httpPostPetAPI(payload);
  return normalizePet(response);
}

export async function updatePet(id: number, payload: UpdatePetRequest) {
  const response: PetApiItem = await httpPutPetAPI(id, payload);
  return normalizePet(response);
}

export async function togglePetStatus(id: number) {
  const response: PetApiItem = await httpPatchPetAPI(id);
  return normalizePet(response);
}

export async function deletePet(id: number) {
  await httpDeletePetAPI(id);
}
