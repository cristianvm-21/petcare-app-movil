import { PetItem } from "./petContract";
import { VetServiceItem } from "./vetServiceContract";
import { UserRole } from "../types/userRole";

export interface AppointmentUserItem {
  id: number;
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: UserRole;
  activo: boolean;
}

export interface AppointmentItem {
  id: number;
  mascota: PetItem;
  veterinario: AppointmentUserItem;
  servicio: VetServiceItem;
  fechaHora: string;
  estado: string;
  notas: string;
  creadoPor: AppointmentUserItem;
  creadoEn: string;
  actualizadoEn: string;
}

export interface AppointmentPageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateAppointmentRequest {
  petId: number;
  veterinarianId: number;
  serviceId: number;
  dateTime: string;
  notes: string;
}

export interface AppointmentResponse {
  content: AppointmentItem[];
  page?: AppointmentPageInfo;
}

export interface ReprogramAppointmentRequest {
  dateTime: string;
}

export interface UpdateAppointmentStatusRequest {
  status: string;
}

export interface GetAppointmentsFilters {
  mascotaId?: number;
  veterinarioId?: number;
  servicioId?: number;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface AppointmentAvailabilityItem {
  dateTime: string;
}
