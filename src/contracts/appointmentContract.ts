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

export interface AppointmentApiPetItem {
  id: number;
  nombre?: string;
  especie?: string;
  raza?: string;
  sexo?: string;
  fechaNacimiento?: string;
  microchip?: string;
  condicionReproductiva?: string;
  alergias?: string;
  enfermedadesCronicas?: string;
  alertasMedicas?: string;
  activo?: boolean;
  name?: string;
  species?: string;
  breed?: string;
  gender?: string;
  birthDate?: string;
  reproductiveCondition?: string;
  allergies?: string;
  chronicDiseases?: string;
  medicalAlerts?: string;
  active?: boolean;
}

export interface AppointmentApiUserItem {
  id: number;
  username: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  email: string;
  telefono?: string;
  rol?: UserRole;
  activo?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  active?: boolean;
}

export interface AppointmentApiServiceItem {
  id: number;
  nombre?: string;
  descripcion?: string;
  duracionMinutos?: number;
  costoReferencial?: number;
  activo?: boolean;
  name?: string;
  description?: string;
  durationMinutes?: number;
  referenceCost?: number;
  active?: boolean;
}

export interface AppointmentApiItem {
  id: number;
  mascota?: AppointmentApiPetItem;
  veterinario?: AppointmentApiUserItem;
  servicio?: AppointmentApiServiceItem;
  fechaHora?: string;
  estado?: string;
  notas?: string;
  creadoPor?: AppointmentApiUserItem;
  creadoEn?: string;
  actualizadoEn?: string;
  petId?: number;
  veterinarianId?: number;
  serviceId?: number;
  dateTime?: string;
  status?: string;
  notes?: string;
  createdBy?: AppointmentApiUserItem | number;
  createdAt?: string;
  updatedBy?: AppointmentApiUserItem | number | null;
  updatedAt?: string;
}

export interface AppointmentApiResponse {
  content: AppointmentApiItem[];
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

export type AppointmentAvailabilityApiItem =
  | AppointmentAvailabilityItem
  | string;

export interface AppointmentAvailabilityResponse {
  content?: AppointmentAvailabilityApiItem[];
  availableSlots?: AppointmentAvailabilityApiItem[];
  veterinarianId?: number;
  date?: string;
  durationMinutes?: number;
}
