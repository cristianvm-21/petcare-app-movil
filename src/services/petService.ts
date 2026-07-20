import {
  httpDeletePetAPI,
  httpGetPetAPI,
  httpGetPetByIdAPI,
  httpGetPetOwnerPrincipalAPI,
  httpPatchPetOwnerPrincipalAPI,
  httpGetPetsByOwnerIdAPI,
  httpPatchPetAPI,
  httpPostPetOwnerLinkAPI,
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

function normalizePetOwnerPrincipal(owner: PetOwnerPrincipalResponse): OwnerItem {
  const normalizedUser = owner.usuario
    ? {
        id: owner.usuario.id,
        nombre: owner.usuario.nombre ?? owner.usuario.names ?? "",
        apellido: owner.usuario.apellido ?? owner.usuario.lastNames ?? "",
        email: owner.usuario.email ?? "",
        telefono: owner.usuario.telefono ?? owner.usuario.phone ?? "",
        rol: owner.usuario.rol ?? "",
        activo: owner.usuario.activo ?? owner.usuario.active ?? true,
      }
    : undefined;

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
  return normalizePetOwnerPrincipal(response);
}

export async function linkPetOwner(
  petId: number,
  ownerId: number,
  relation: string,
) {
  const response: PetApiItem = await httpPostPetOwnerLinkAPI(
    petId,
    ownerId,
    relation,
  );
  return normalizePet(response);
}

export async function changePetOwnerPrincipal(petId: number) {
  const response: PetApiItem = await httpPatchPetOwnerPrincipalAPI(petId);
  return normalizePet(response);
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
