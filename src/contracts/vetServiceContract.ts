export interface VetServiceItem {
  id: number;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  costoReferencial: number;
  activo: boolean;
}

export interface VetServiceApiItem {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  referenceCost: number;
  active: boolean;
}

export interface CreateVetServiceRequest {
  name: string;
  description: string;
  durationMinutes: number;
  referentialCost: number;
}

export type UpdateVetServiceRequest = CreateVetServiceRequest;

export interface VetServiceResponse {
  content: VetServiceApiItem[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export interface GetVetServicesFilters {
  soloActivos?: boolean;
  nombre?: string;
}
