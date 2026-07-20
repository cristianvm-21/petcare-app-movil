import {
  httpGetTriageAPI,
  httpGetTriageByAppointmentIdAPI,
  httpGetTriageByIdAPI,
  httpGetTriagesByUrgencyAPI,
  httpPostTriageAPI,
} from "../api/triageHttp";
import {
  CreateTriageRequest,
  TriageApiItem,
  TriageApiResponse,
  TriageByAppointmentResponse,
  TriageByUrgencyResponse,
  TriageItem,
} from "../contracts/triageContract";

function normalizeTriage(item: TriageApiItem): TriageItem {
  return {
    id: item.id,
    appointmentId: item.appointmentId ?? 0,
    reasonForVisit: item.reasonForVisit ?? "",
    urgencyLevel: item.urgencyLevel ?? "",
    visibleSigns: item.visibleSigns ?? "",
    observations: item.observations ?? "",
    weight: item.weight ?? 0,
    temperature: item.temperature ?? 0,
    heartRate: item.heartRate ?? 0,
    respiratoryRate: item.respiratoryRate ?? 0,
    assistantId: item.assistantId ?? 0,
    createdAt: item.createdAt ?? "",
    updatedAt: item.updatedAt ?? "",
  };
}

function normalizeTriageList(
  response: TriageApiResponse | TriageByUrgencyResponse | TriageByAppointmentResponse,
) {
  if (Array.isArray(response)) {
    return response.map(normalizeTriage);
  }

  if ("content" in response && Array.isArray(response.content)) {
    return response.content.map(normalizeTriage);
  }

  if ("id" in response) {
    return [normalizeTriage(response)];
  }

  return [];
}

export async function findAllTriages() {
  const response = await httpGetTriageAPI();
  return normalizeTriageList(response);
}

export async function findTriageById(id: number) {
  const response = await httpGetTriageByIdAPI(id);
  return normalizeTriage(response);
}

export async function findTriagesByUrgency(urgencyLevel: string) {
  const response = await httpGetTriagesByUrgencyAPI(urgencyLevel);
  return normalizeTriageList(response);
}

export async function findTriagesByAppointmentId(appointmentId: number) {
  const response = await httpGetTriageByAppointmentIdAPI(appointmentId);
  return normalizeTriageList(response);
}

export async function createTriage(payload: CreateTriageRequest) {
  const response = await httpPostTriageAPI(payload);
  return normalizeTriage(response);
}
