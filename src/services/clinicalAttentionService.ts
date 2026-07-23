import {
  httpGetClinicalAttentionAPI,
  httpGetClinicalAttentionByAppointmentIdAPI,
  httpGetClinicalAttentionByIdAPI,
  httpGetClinicalAttentionByPetIdAPI,
  httpPostClinicalAttentionAPI,
  httpPutClinicalAttentionAPI,
} from "../api/clinicalAttentionHttp";
import {
  ClinicalAttentionApiItem,
  ClinicalAttentionByAppointmentResponse,
  ClinicalAttentionByPetResponse,
  ClinicalAttentionItem,
  ClinicalAttentionResponse,
  CreateClinicalAttentionRequest,
  UpdateClinicalAttentionRequest,
} from "../contracts/clinicalAttentionContract";

function normalizeClinicalAttention(
  item: ClinicalAttentionApiItem,
): ClinicalAttentionItem {
  return {
    id: item.id,
    appointmentId: item.appointmentId ?? 0,
    petId: item.petId ?? 0,
    veterinarianId: item.veterinarianId ?? 0,
    triageId: item.triageId ?? 0,
    reasonForConsultation: item.reasonForConsultation ?? "",
    symptoms: item.symptoms ?? "",
    diagnosis: item.diagnosis ?? "",
    treatment: item.treatment ?? "",
    clinicalObservations: item.clinicalObservations ?? "",
    createdBy: item.createdBy ?? 0,
    createdAt: item.createdAt ?? "",
    updatedBy: item.updatedBy ?? null,
    updatedAt: item.updatedAt ?? "",
  };
}

function normalizeClinicalAttentionList(
  response:
    | ClinicalAttentionResponse
    | ClinicalAttentionByPetResponse
    | ClinicalAttentionByAppointmentResponse,
) {
  if (Array.isArray(response)) {
    return response.map(normalizeClinicalAttention);
  }

  if ("content" in response && Array.isArray(response.content)) {
    return response.content.map(normalizeClinicalAttention);
  }

  if ("id" in response) {
    return [normalizeClinicalAttention(response)];
  }

  return [];
}

export async function findAllClinicalAttentions() {
  const response = await httpGetClinicalAttentionAPI();
  return normalizeClinicalAttentionList(response);
}

export async function findClinicalAttentionById(id: number) {
  const response = await httpGetClinicalAttentionByIdAPI(id);
  return normalizeClinicalAttention(response);
}

export async function findClinicalAttentionsByPetId(petId: number) {
  const response = await httpGetClinicalAttentionByPetIdAPI(petId);
  return normalizeClinicalAttentionList(response);
}

export async function findClinicalAttentionsByAppointmentId(
  appointmentId: number,
) {
  const response =
    await httpGetClinicalAttentionByAppointmentIdAPI(appointmentId);
  return normalizeClinicalAttentionList(response);
}

export async function createClinicalAttention(
  payload: CreateClinicalAttentionRequest,
) {
  const response = await httpPostClinicalAttentionAPI(payload);
  return normalizeClinicalAttention(response);
}

export async function updateClinicalAttention(
  id: number,
  payload: UpdateClinicalAttentionRequest,
) {
  const response = await httpPutClinicalAttentionAPI(id, payload);
  return normalizeClinicalAttention(response);
}
