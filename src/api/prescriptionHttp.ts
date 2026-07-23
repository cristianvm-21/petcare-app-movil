import { springbootApi } from "./axiosHttp";
import {
  CreatePrescriptionRequest,
  PrescriptionApiItem,
  PrescriptionByAttentionResponse,
} from "../contracts/prescriptionContract";

function sanitizePrescriptionPayload(payload: CreatePrescriptionRequest) {
  const details = payload.detalles
    .map((detail) => ({
      medicamento: detail.medicamento.trim(),
      presentacion: detail.presentacion.trim(),
      dosis: detail.dosis.trim(),
      frecuencia: detail.frecuencia.trim(),
      duracion: detail.duracion.trim(),
      viaAdministracion: detail.viaAdministracion.trim(),
      indicaciones: detail.indicaciones.trim(),
    }))
    .filter(
      (detail) =>
        detail.medicamento ||
        detail.presentacion ||
        detail.dosis ||
        detail.frecuencia ||
        detail.duracion ||
        detail.viaAdministracion ||
        detail.indicaciones,
    )
    .map((detail) => ({
      medicamento: detail.medicamento,
      ...(detail.presentacion ? { presentacion: detail.presentacion } : {}),
      dosis: detail.dosis,
      frecuencia: detail.frecuencia,
      duracion: detail.duracion,
      ...(detail.viaAdministracion
        ? { viaAdministracion: detail.viaAdministracion }
        : {}),
      ...(detail.indicaciones ? { indicaciones: detail.indicaciones } : {}),
    }));

  return {
    diagnostico: payload.diagnostico.trim(),
    veterinarioId: payload.veterinarioId,
    ...(payload.notasAdicionales.trim()
      ? { notasAdicionales: payload.notasAdicionales.trim() }
      : {}),
    ...(details.length > 0 ? { detalles: details } : {}),
  };
}

export async function httpGetPrescriptionsByAttentionAPI(attentionId: number) {
  const response = await springbootApi.get<PrescriptionByAttentionResponse>(
    `atenciones-clinicas/${attentionId}/recetas`,
  );
  return response.data;
}

export async function httpGetPrescriptionByIdAPI(id: number) {
  const response = await springbootApi.get<PrescriptionApiItem>(`recetas/${id}`);
  return response.data;
}

export async function httpPostPrescriptionAPI(
  attentionId: number,
  payload: CreatePrescriptionRequest,
) {
  const response = await springbootApi.post<PrescriptionApiItem>(
    `atenciones-clinicas/${attentionId}/recetas`,
    sanitizePrescriptionPayload(payload),
  );
  return response.data;
}

export async function httpPutPrescriptionAPI(
  id: number,
  payload: CreatePrescriptionRequest,
) {
  const response = await springbootApi.put<PrescriptionApiItem>(
    `recetas/${id}`,
    sanitizePrescriptionPayload(payload),
  );
  return response.data;
}
