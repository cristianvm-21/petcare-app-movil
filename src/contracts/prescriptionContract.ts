export interface PrescriptionDetailItem {
  id: number;
  medicamento: string;
  presentacion: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  viaAdministracion: string;
  indicaciones: string;
}

export interface PrescriptionItem {
  id: number;
  atencionClinicaId: number;
  mascotaId: number;
  mascotaNombre: string;
  veterinarioId: number;
  veterinarioNombre: string;
  diagnostico: string;
  notasAdicionales: string;
  estado: string;
  createdBy: number;
  createdAt: string;
  detalles: PrescriptionDetailItem[];
}

export interface CreatePrescriptionDetailRequest {
  medicamento: string;
  presentacion: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  viaAdministracion: string;
  indicaciones: string;
}

export interface CreatePrescriptionRequest {
  diagnostico: string;
  notasAdicionales: string;
  veterinarioId: number;
  detalles: CreatePrescriptionDetailRequest[];
}

export type UpdatePrescriptionRequest = CreatePrescriptionRequest;

export interface PrescriptionApiDetailItem {
  id?: number;
  medicamento?: string;
  presentacion?: string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
  viaAdministracion?: string;
  indicaciones?: string;
}

export interface PrescriptionApiItem {
  id: number;
  atencionClinicaId?: number;
  mascotaId?: number;
  mascotaNombre?: string;
  veterinarioId?: number;
  veterinarioNombre?: string;
  diagnostico?: string;
  notasAdicionales?: string;
  estado?: string;
  createdBy?: number;
  createdAt?: string;
  detalles?: PrescriptionApiDetailItem[] | null;
}

export interface PrescriptionResponse {
  content: PrescriptionApiItem[];
}

export type PrescriptionByAttentionResponse =
  | PrescriptionApiItem[]
  | PrescriptionResponse;
