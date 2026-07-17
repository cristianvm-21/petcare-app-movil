import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/pageRequestContract";
import {
  AppointmentAvailabilityItem,
  AppointmentItem,
  AppointmentResponse,
  CreateAppointmentRequest,
  GetAppointmentsFilters,
  ReprogramAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from "../contracts/appointmentContract";

const appointmentPageRequest: PageRequest = {
  page: 0,
  size: 100,
};

type GetAppointmentsParams = Partial<PageRequest> & GetAppointmentsFilters;

export async function httpGetAppointmentAPI(params?: GetAppointmentsParams) {
  const response = await springbootApi.get<AppointmentResponse>("citas", {
    params: {
      ...appointmentPageRequest,
      ...params,
    },
  });
  return response.data;
}

export async function httpGetAppointmentByIdAPI(id: number) {
  const response = await springbootApi.get<AppointmentItem>(`citas/${id}`);
  return response.data;
}

export async function httpGetAppointmentsByPetIdAPI(
  petId: number,
  params?: Partial<PageRequest>,
) {
  const response = await springbootApi.get<AppointmentResponse>(
    `citas/mascota/${petId}`,
    {
      params: {
        ...appointmentPageRequest,
        ...params,
      },
    },
  );
  return response.data;
}

export async function httpGetAppointmentsByVeterinarianIdAPI(
  veterinarianId: number,
  params?: Partial<PageRequest>,
) {
  const response = await springbootApi.get<AppointmentResponse>(
    `citas/veterinario/${veterinarianId}`,
    {
      params: {
        ...appointmentPageRequest,
        ...params,
      },
    },
  );
  return response.data;
}

export async function httpGetAppointmentAvailabilityAPI(params: {
  veterinarioId: number;
  servicioId: number;
  fecha: string;
}) {
  const response = await springbootApi.get<AppointmentAvailabilityItem[]>(
    "citas/disponibilidad",
    {
      params,
    },
  );
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
