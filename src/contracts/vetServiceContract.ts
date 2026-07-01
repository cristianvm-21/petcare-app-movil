export interface VetServiceItem {
  id: number;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  costoReferencial: number;
  activo: boolean;
}

export interface CreateVetServiceRequest {
  name: string;
  description: string;
  durationMinutes: number;
  referentialCost: number;
}

export interface VetServiceResponse {
  content: VetServiceItem[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}
