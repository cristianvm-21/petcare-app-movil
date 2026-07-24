export interface TreatmentPlanActivityItem {
  id: number;
  tipo: string;
  descripcion: string;
  fechaProgramada: string;
  horaProgramada: string;
  frecuencia: string;
  responsable: string;
  estado: string;
  observaciones: string;
}

export interface TreatmentPlanItem {
  id: number;
  mascotaId: number;
  mascotaNombre: string;
  atencionClinicaId: number;
  veterinarioId: number;
  veterinarioNombre: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFinEstimada: string;
  estado: string;
  createdBy: number;
  createdAt: string;
  actividades: TreatmentPlanActivityItem[];
}

export interface CreateTreatmentPlanActivityRequest {
  tipo: string;
  descripcion: string;
  fechaProgramada: string;
  horaProgramada: string;
  frecuencia: string;
  responsable: string;
  observaciones: string;
}

export interface CreateTreatmentPlanRequest {
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFinEstimada: string;
  veterinarioId: number;
  actividades: CreateTreatmentPlanActivityRequest[];
}

export type UpdateTreatmentPlanRequest = CreateTreatmentPlanRequest;

export interface TreatmentPlanActivityApiItem {
  id?: number;
  tipo?: string;
  descripcion?: string;
  fechaProgramada?: string;
  horaProgramada?: string;
  frecuencia?: string | null;
  responsable?: string | null;
  estado?: string;
  observaciones?: string | null;
}

export interface TreatmentPlanApiItem {
  id: number;
  mascotaId?: number;
  mascotaNombre?: string;
  atencionClinicaId?: number;
  veterinarioId?: number;
  veterinarioNombre?: string;
  titulo?: string;
  descripcion?: string | null;
  fechaInicio?: string;
  fechaFinEstimada?: string | null;
  estado?: string;
  createdBy?: number;
  createdAt?: string;
  actividades?: TreatmentPlanActivityApiItem[] | null;
}

export interface TreatmentPlanResponse {
  content: TreatmentPlanApiItem[];
}

export type TreatmentPlanByAttentionResponse =
  | TreatmentPlanApiItem[]
  | TreatmentPlanResponse;
