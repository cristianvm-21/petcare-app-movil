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
  const response = await springbootApi.post<TriageApiItem>("triajes", payload);
  return response.data;
}
