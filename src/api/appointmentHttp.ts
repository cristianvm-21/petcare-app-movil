import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/pageRequestContract";
import {
  AppointmentItem,
  AppointmentResponse,
  CreateAppointmentRequest,
  ReprogramAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from "../contracts/appointmentContract";

const appointmentPageRequest: PageRequest = {
  page: 0,
  size: 100,
};

export async function httpGetAppointmentAPI() {
  const response = await springbootApi.get<AppointmentResponse>("citas", {
    params: appointmentPageRequest,
  });
  return response.data;
}

export async function httpGetAppointmentByIdAPI(id: number) {
  const response = await springbootApi.get<AppointmentItem>(`citas/${id}`);
  return response.data;
}

export async function httpPostAppointmentAPI(
  payload: CreateAppointmentRequest,
) {
  const response = await springbootApi.post<AppointmentItem>("citas", payload);
  return response.data;
}

export async function httpPutAppointmentRescheduleAPI(
  id: number,
  payload: ReprogramAppointmentRequest,
) {
  const response = await springbootApi.put<AppointmentItem>(
    `citas/${id}/reprogramar`,
    payload,
  );
  return response.data;
}

export async function httpPutAppointmentStatusAPI(
  id: number,
  payload: UpdateAppointmentStatusRequest,
) {
  const response = await springbootApi.put<AppointmentItem>(
    `citas/${id}/estado`,
    payload,
  );
  return response.data;
}

export async function httpDeleteAppointmentAPI(id: number) {
  await springbootApi.delete(`citas/${id}`);
}
