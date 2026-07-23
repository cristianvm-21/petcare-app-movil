import { springbootApi } from "./axiosHttp";
import {
  CreateFollowUpRequest,
  FollowUpApiItem,
  FollowUpByAttentionResponse,
} from "../contracts/followUpContract";

function sanitizeFollowUpPayload(payload: CreateFollowUpRequest) {
  return {
    veterinarioId: payload.veterinarioId,
    tipo: payload.tipo.trim(),
    fechaProgramada: payload.fechaProgramada.trim(),
    motivo: payload.motivo.trim(),
    ...(typeof payload.duenoNotificadoId === "number" &&
    payload.duenoNotificadoId > 0
      ? { duenoNotificadoId: payload.duenoNotificadoId }
      : {}),
  };
}

export async function httpGetFollowUpsByAttentionAPI(attentionId: number) {
  const response = await springbootApi.get<FollowUpByAttentionResponse>(
    `atenciones-clinicas/${attentionId}/seguimientos`,
  );
  return response.data;
}

export async function httpGetUpcomingFollowUpsAPI() {
  const response = await springbootApi.get<FollowUpByAttentionResponse>(
    "seguimientos/proximos",
  );
  return response.data;
}

export async function httpPostFollowUpAPI(
  attentionId: number,
  payload: CreateFollowUpRequest,
) {
  const response = await springbootApi.post<FollowUpApiItem>(
    `atenciones-clinicas/${attentionId}/seguimientos`,
    sanitizeFollowUpPayload(payload),
  );
  return response.data;
}

export async function httpPatchCompleteFollowUpAPI(
  id: number,
  result: string,
) {
  const response = await springbootApi.patch<FollowUpApiItem>(
    `seguimientos/${id}/completar`,
    null,
    {
      params: {
        resultado: result.trim(),
      },
    },
  );
  return response.data;
}

export async function httpPatchCancelFollowUpAPI(id: number) {
  const response = await springbootApi.patch<FollowUpApiItem>(
    `seguimientos/${id}/cancelar`,
  );
  return response.data;
}
