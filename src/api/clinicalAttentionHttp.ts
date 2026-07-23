import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/pageRequestContract";
import {
  ClinicalAttentionApiItem,
  ClinicalAttentionByAppointmentResponse,
  ClinicalAttentionByPetResponse,
  ClinicalAttentionResponse,
  CreateClinicalAttentionRequest,
  UpdateClinicalAttentionRequest,
} from "../contracts/clinicalAttentionContract";

const clinicalAttentionPageRequest: PageRequest = {
  page: 0,
  size: 100,
};

export async function httpGetClinicalAttentionAPI(params?: Partial<PageRequest>) {
  const response = await springbootApi.get<ClinicalAttentionResponse>(
    "atenciones-clinicas",
    {
      params: {
        ...clinicalAttentionPageRequest,
        ...params,
      },
    },
  );
  return response.data;
}

export async function httpGetClinicalAttentionByIdAPI(id: number) {
  const response = await springbootApi.get<ClinicalAttentionApiItem>(
    `atenciones-clinicas/${id}`,
  );
  return response.data;
}

export async function httpGetClinicalAttentionByPetIdAPI(petId: number) {
  const response = await springbootApi.get<ClinicalAttentionByPetResponse>(
    `atenciones-clinicas/mascota/${petId}`,
  );
  return response.data;
}

export async function httpGetClinicalAttentionByAppointmentIdAPI(
  appointmentId: number,
) {
  const response =
    await springbootApi.get<ClinicalAttentionByAppointmentResponse>(
      `atenciones-clinicas/cita/${appointmentId}`,
    );
  return response.data;
}

export async function httpPostClinicalAttentionAPI(
  payload: CreateClinicalAttentionRequest,
) {
  const sanitizedPayload = {
    appointmentId: payload.appointmentId,
    triageId: payload.triageId,
    reasonForConsultation: payload.reasonForConsultation.trim(),
    diagnosis: payload.diagnosis.trim(),
    ...(payload.symptoms.trim() ? { symptoms: payload.symptoms.trim() } : {}),
    ...(payload.clinicalObservations.trim()
      ? { clinicalObservations: payload.clinicalObservations.trim() }
      : {}),
    ...(payload.treatment.trim() ? { treatment: payload.treatment.trim() } : {}),
  };

  const response = await springbootApi.post<ClinicalAttentionApiItem>(
    "atenciones-clinicas",
    sanitizedPayload,
  );
  return response.data;
}

export async function httpPutClinicalAttentionAPI(
  id: number,
  payload: UpdateClinicalAttentionRequest,
) {
  const sanitizedPayload = {
    appointmentId: payload.appointmentId,
    triageId: payload.triageId,
    reasonForConsultation: payload.reasonForConsultation.trim(),
    diagnosis: payload.diagnosis.trim(),
    ...(payload.symptoms.trim() ? { symptoms: payload.symptoms.trim() } : {}),
    ...(payload.clinicalObservations.trim()
      ? { clinicalObservations: payload.clinicalObservations.trim() }
      : {}),
    ...(payload.treatment.trim() ? { treatment: payload.treatment.trim() } : {}),
  };

  const response = await springbootApi.put<ClinicalAttentionApiItem>(
    `atenciones-clinicas/${id}`,
    sanitizedPayload,
  );
  return response.data;
}
