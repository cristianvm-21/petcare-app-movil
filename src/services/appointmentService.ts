import {
  httpDeleteAppointmentAPI,
  httpGetAppointmentAPI,
  httpGetAppointmentAvailabilityAPI,
  httpGetAppointmentByIdAPI,
  httpGetAppointmentsByPetIdAPI,
  httpGetAppointmentsByVeterinarianIdAPI,
  httpPostAppointmentAPI,
  httpPutAppointmentRescheduleAPI,
  httpPutAppointmentStatusAPI,
} from "../api/appointmentHttp";
import {
  AppointmentAvailabilityItem,
  AppointmentItem,
  AppointmentResponse,
  CreateAppointmentRequest,
  GetAppointmentsFilters,
  ReprogramAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from "../contracts/appointmentContract";

function normalizeAppointmentList(response: AppointmentResponse) {
  return response.content ?? [];
}

export async function findAllAppointments(filters?: GetAppointmentsFilters) {
  const response: AppointmentResponse = await httpGetAppointmentAPI(filters);
  return normalizeAppointmentList(response);
}

export async function findAppointmentById(id: number) {
  const response: AppointmentItem = await httpGetAppointmentByIdAPI(id);
  return response;
}

export async function findAppointmentsByPetId(petId: number) {
  const response: AppointmentResponse = await httpGetAppointmentsByPetIdAPI(petId);
  return normalizeAppointmentList(response);
}

export async function findAppointmentsByVeterinarianId(veterinarianId: number) {
  const response: AppointmentResponse =
    await httpGetAppointmentsByVeterinarianIdAPI(veterinarianId);
  return normalizeAppointmentList(response);
}

export async function findAppointmentAvailability(params: {
  veterinarioId: number;
  servicioId: number;
  fecha: string;
}) {
  const response: AppointmentAvailabilityItem[] =
    await httpGetAppointmentAvailabilityAPI(params);
  return response;
}

export async function createAppointment(payload: CreateAppointmentRequest) {
  const response: AppointmentItem = await httpPostAppointmentAPI(payload);
  return response;
}

export async function reprogramAppointment(
  id: number,
  payload: ReprogramAppointmentRequest,
) {
  const response: AppointmentItem = await httpPutAppointmentRescheduleAPI(
    id,
    payload,
  );
  return response;
}

export async function updateAppointmentStatus(
  id: number,
  payload: UpdateAppointmentStatusRequest,
) {
  const response: AppointmentItem = await httpPutAppointmentStatusAPI(id, payload);
  return response;
}

export async function deleteAppointment(id: number) {
  await httpDeleteAppointmentAPI(id);
}
