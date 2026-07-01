import {
  httpDeleteAppointmentAPI,
  httpGetAppointmentAPI,
  httpGetAppointmentByIdAPI,
  httpPostAppointmentAPI,
  httpPutAppointmentRescheduleAPI,
  httpPutAppointmentStatusAPI,
} from "../api/appointmentHttp";
import {
  AppointmentItem,
  AppointmentResponse,
  CreateAppointmentRequest,
  ReprogramAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from "../contracts/appointmentContract";

export async function findAllAppointments() {
  const response: AppointmentResponse = await httpGetAppointmentAPI();
  return response.content ?? [];
}

export async function findAppointmentById(id: number) {
  const response: AppointmentItem = await httpGetAppointmentByIdAPI(id);
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
