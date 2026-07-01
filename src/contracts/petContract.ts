import { OwnerItem } from "./ownerContract";

export interface PetItem {
  id: number;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  fechaNacimiento: string;
  microchip: string;
  condicionReproductiva: string;
  alergias: string;
  enfermedadesCronicas: string;
  alertasMedicas: string;
  activo: boolean;
}

export interface CreatePetRequest {
  name: string;
  species: string;
  breed: string;
  gender: string;
  birthDate: string;
  microchip: string;
  reproductiveCondition: string;
  allergies: string;
  chronicDiseases: string;
  medicalAlerts: string;
  ownerId: number;
  ownerRelation: string;
}

export type UpdatePetRequest = CreatePetRequest;

export interface PetPageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PetResponse {
  content: PetItem[];
  page?: PetPageInfo;
}

export type PetsByOwnerResponse = PetResponse | PetItem[];

export type PetOwnerPrincipalResponse = OwnerItem;
