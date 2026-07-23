export interface ClinicalAttentionItem {
  id: number;
  appointmentId: number;
  petId: number;
  veterinarianId: number;
  triageId: number;
  reasonForConsultation: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  clinicalObservations: string;
  createdBy: number;
  createdAt: string;
  updatedBy: number | null;
  updatedAt: string;
}

export interface CreateClinicalAttentionRequest {
  appointmentId: number;
  reasonForConsultation: string;
  symptoms: string;
  diagnosis: string;
  clinicalObservations: string;
  treatment: string;
  triageId: number;
}

export type UpdateClinicalAttentionRequest = CreateClinicalAttentionRequest;

export interface ClinicalAttentionPageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface ClinicalAttentionApiItem {
  id: number;
  appointmentId?: number;
  petId?: number;
  veterinarianId?: number;
  triageId?: number;
  reasonForConsultation?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  clinicalObservations?: string;
  createdBy?: number;
  createdAt?: string;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface ClinicalAttentionResponse {
  content: ClinicalAttentionApiItem[];
  page?: ClinicalAttentionPageInfo;
}

export type ClinicalAttentionByPetResponse =
  | ClinicalAttentionApiItem
  | ClinicalAttentionApiItem[]
  | ClinicalAttentionResponse;

export type ClinicalAttentionByAppointmentResponse =
  | ClinicalAttentionApiItem
  | ClinicalAttentionApiItem[]
  | ClinicalAttentionResponse;
