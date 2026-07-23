import { springbootApi } from "./axiosHttp";
import {
  CreateTriageRequest,
  TriageApiItem,
  TriageApiResponse,
  TriageByAppointmentResponse,
  TriageByUrgencyResponse,
} from "../contracts/triageContract";
import { PageRequest } from "../contracts/pageRequestContract";

const triagePageRequest: PageRequest = {
  page: 0,
  size: 100,
};

export async function httpGetTriageAPI(params?: Partial<PageRequest>) {
  const response = await springbootApi.get<TriageApiResponse>("triajes", {
    params: {
      ...triagePageRequest,
      ...params,
    },
  });
  return response.data;
}

export async function httpGetTriageByIdAPI(id: number) {
  const response = await springbootApi.get<TriageApiItem>(`triajes/${id}`);
  return response.data;
}

export async function httpGetTriagesByUrgencyAPI(
  urgencyLevel: string,
  params?: Partial<PageRequest>,
) {
  const response = await springbootApi.get<TriageByUrgencyResponse>(
    `triajes/prioridad/${urgencyLevel}`,
    {
      params: {
        ...triagePageRequest,
        ...params,
      },
    },
  );
  return response.data;
}

export async function httpGetTriageByAppointmentIdAPI(citaId: number) {
  const response = await springbootApi.get<TriageByAppointmentResponse>(
    `triajes/cita/${citaId}`,
  );
  return response.data;
}

export async function httpPostTriageAPI(payload: CreateTriageRequest) {
  const sanitizedPayload = {
    appointmentId: payload.appointmentId,
    reasonForVisit: payload.reasonForVisit,
    urgencyLevel: payload.urgencyLevel,
    ...(payload.visibleSigns.trim()
      ? { visibleSigns: payload.visibleSigns.trim() }
      : {}),
    ...(payload.observations.trim()
      ? { observations: payload.observations.trim() }
      : {}),
    ...(typeof payload.weight === "number" && !Number.isNaN(payload.weight)
      ? { weight: payload.weight }
      : {}),
    ...(typeof payload.temperature === "number" &&
    !Number.isNaN(payload.temperature)
      ? { temperature: payload.temperature }
      : {}),
    ...(typeof payload.heartRate === "number" &&
    !Number.isNaN(payload.heartRate)
      ? { heartRate: payload.heartRate }
      : {}),
    ...(typeof payload.respiratoryRate === "number" &&
    !Number.isNaN(payload.respiratoryRate)
      ? { respiratoryRate: payload.respiratoryRate }
      : {}),
  };

  const response = await springbootApi.post<TriageApiItem>(
    "triajes",
    sanitizedPayload,
  );
  return response.data;
}
