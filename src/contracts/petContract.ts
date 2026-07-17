import { OwnerApiItem } from "./ownerContract";

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

export interface PetApiItem {
  id: number;
  nombre?: string;
  especie?: string;
  raza?: string;
  sexo?: string;
  fechaNacimiento?: string;
  microchip?: string;
  condicionReproductiva?: string;
  alergias?: string | null;
  enfermedadesCronicas?: string | null;
  alertasMedicas?: string | null;
  activo?: boolean;
  name?: string;
  breed?: string;
  gender?: string;
  dateOfBirth?: string;
  reproductiveCondition?: string;
  allergies?: string | null;
  chronicDiseases?: string | null;
  medicalAlerts?: string | null;
  active?: boolean;
}

export interface PetApiResponse {
  content: PetApiItem[];
  page?: PetPageInfo;
}

export interface GetPetsFilters {
  nombre?: string;
  especie?: string;
  raza?: string;
  sexo?: string;
  activo?: boolean;
  duenoId?: number;
}

export type PetsByOwnerResponse = PetResponse;

export type PetOwnerPrincipalResponse = OwnerApiItem;
