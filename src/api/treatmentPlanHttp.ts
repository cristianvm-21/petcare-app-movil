import { springbootApi } from "./axiosHttp";
import {
  CreateTreatmentPlanRequest,
  TreatmentPlanApiItem,
  TreatmentPlanByAttentionResponse,
} from "../contracts/treatmentPlanContract";

function sanitizeTreatmentPlanPayload(payload: CreateTreatmentPlanRequest) {
  const activities = payload.actividades
    .map((activity) => ({
      tipo: activity.tipo.trim(),
      descripcion: activity.descripcion.trim(),
      fechaProgramada: activity.fechaProgramada.trim(),
      horaProgramada: activity.horaProgramada.trim(),
      frecuencia: activity.frecuencia.trim(),
      responsable: activity.responsable.trim(),
      observaciones: activity.observaciones.trim(),
    }))
    .filter(
      (activity) =>
        activity.tipo ||
        activity.descripcion ||
        activity.fechaProgramada ||
        activity.horaProgramada ||
        activity.frecuencia ||
        activity.responsable ||
        activity.observaciones,
    )
    .map((activity) => ({
      tipo: activity.tipo,
      descripcion: activity.descripcion,
      ...(activity.fechaProgramada
        ? { fechaProgramada: activity.fechaProgramada }
        : {}),
      ...(activity.horaProgramada ? { horaProgramada: activity.horaProgramada } : {}),
      ...(activity.frecuencia ? { frecuencia: activity.frecuencia } : {}),
      ...(activity.responsable ? { responsable: activity.responsable } : {}),
      ...(activity.observaciones ? { observaciones: activity.observaciones } : {}),
    }));

  return {
    titulo: payload.titulo.trim(),
    fechaInicio: payload.fechaInicio.trim(),
    veterinarioId: payload.veterinarioId,
    ...(payload.descripcion.trim()
      ? { descripcion: payload.descripcion.trim() }
      : {}),
    ...(payload.fechaFinEstimada.trim()
      ? { fechaFinEstimada: payload.fechaFinEstimada.trim() }
      : {}),
    ...(activities.length > 0 ? { actividades: activities } : {}),
  };
}

export async function httpGetTreatmentPlansByAttentionAPI(attentionId: number) {
  const response = await springbootApi.get<TreatmentPlanByAttentionResponse>(
    `atenciones-clinicas/${attentionId}/planes`,
  );
  return response.data;
}

export async function httpGetTreatmentPlanByIdAPI(id: number) {
  const response = await springbootApi.get<TreatmentPlanApiItem>(`planes/${id}`);
  return response.data;
}

export async function httpPostTreatmentPlanAPI(
  attentionId: number,
  payload: CreateTreatmentPlanRequest,
) {
  const response = await springbootApi.post<TreatmentPlanApiItem>(
    `atenciones-clinicas/${attentionId}/planes`,
    sanitizeTreatmentPlanPayload(payload),
  );
  return response.data;
}

export async function httpPutTreatmentPlanAPI(
  id: number,
  payload: CreateTreatmentPlanRequest,
) {
  const response = await springbootApi.put<TreatmentPlanApiItem>(
    `planes/${id}`,
    sanitizeTreatmentPlanPayload(payload),
  );
  return response.data;
}

export async function httpPatchTreatmentPlanStatusAPI(
  id: number,
  status: string,
) {
  const response = await springbootApi.patch<TreatmentPlanApiItem>(
    `planes/${id}/estado`,
    null,
    {
      params: {
        estado: status,
      },
    },
  );
  return response.data;
}
