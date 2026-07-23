export type TriageUrgencyLevel =
  | "RUTINARIA"
  | "PREFERENTE"
  | "URGENTE"
  | "EMERGENCIA";

export interface TriageItem {
  id: number;
  appointmentId: number;
  reasonForVisit: string;
  urgencyLevel: TriageUrgencyLevel | string;
  visibleSigns: string;
  observations: string;
  weight: number;
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  assistantId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTriageRequest {
  appointmentId: number;
  reasonForVisit: string;
  urgencyLevel: TriageUrgencyLevel | string;
  visibleSigns: string;
  observations: string;
  weight?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
}

export interface TriagePageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface TriageResponse {
  content: TriageItem[];
  page?: TriagePageInfo;
}

export interface TriageApiItem {
  id: number;
  appointmentId?: number;
  reasonForVisit?: string;
  urgencyLevel?: string;
  visibleSigns?: string;
  observations?: string;
  weight?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  assistantId?: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface TriageApiResponse {
  content: TriageApiItem[];
  page?: TriagePageInfo;
}

export type TriageByAppointmentResponse =
  | TriageApiItem
  | TriageApiItem[]
  | TriageApiResponse;

export type TriageByUrgencyResponse = TriageApiItem[] | TriageApiResponse;
