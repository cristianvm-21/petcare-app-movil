export interface VetServiceItem {
  id: number;
  nombre: string;
  descripcion: string;
  duracionMinutos: number;
  costoReferencial: number;
  activo: boolean;
}

export interface VetServiceResponse {
  content?: VetServiceItem[];
  data?: VetServiceItem[];
  servicios?: VetServiceItem[];
}
