export interface FollowUpItem {
  id: number;
  atencionClinicaId: number;
  mascotaId: number;
  mascotaNombre: string;
  veterinarioId: number;
  veterinarioNombre: string;
  duenoNotificadoId: number | null;
  tipo: string;
  fechaProgramada: string;
  fechaCompletada: string;
  motivo: string;
  resultado: string;
  estado: string;
  createdAt: string;
}

export interface CreateFollowUpRequest {
  veterinarioId: number;
  tipo: string;
  fechaProgramada: string;
  motivo: string;
  duenoNotificadoId?: number;
}

export interface CompleteFollowUpRequest {
  resultado: string;
}

export interface FollowUpApiItem {
  id: number;
  atencionClinicaId?: number;
  mascotaId?: number;
  mascotaNombre?: string;
  veterinarioId?: number;
  veterinarioNombre?: string;
  duenoNotificadoId?: number | null;
  tipo?: string;
  fechaProgramada?: string;
  fechaCompletada?: string | null;
  motivo?: string;
  resultado?: string | null;
  estado?: string;
  createdAt?: string;
}

export interface FollowUpResponse {
  content: FollowUpApiItem[];
}

export type FollowUpByAttentionResponse =
  | FollowUpApiItem[]
  | FollowUpResponse;
