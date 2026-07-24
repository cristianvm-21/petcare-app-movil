import {
  httpGetFollowUpsByAttentionAPI,
  httpGetUpcomingFollowUpsAPI,
  httpPatchCancelFollowUpAPI,
  httpPatchCompleteFollowUpAPI,
  httpPostFollowUpAPI,
} from "../api/followUpHttp";
import {
  CreateFollowUpRequest,
  FollowUpApiItem,
  FollowUpByAttentionResponse,
  FollowUpItem,
} from "../contracts/followUpContract";

function normalizeFollowUp(item: FollowUpApiItem): FollowUpItem {
  return {
    id: item.id,
    atencionClinicaId: item.atencionClinicaId ?? 0,
    mascotaId: item.mascotaId ?? 0,
    mascotaNombre: item.mascotaNombre ?? "",
    veterinarioId: item.veterinarioId ?? 0,
    veterinarioNombre: item.veterinarioNombre ?? "",
    duenoNotificadoId: item.duenoNotificadoId ?? null,
    tipo: item.tipo ?? "",
    fechaProgramada: item.fechaProgramada ?? "",
    fechaCompletada: item.fechaCompletada ?? "",
    motivo: item.motivo ?? "",
    resultado: item.resultado ?? "",
    estado: item.estado ?? "",
    createdAt: item.createdAt ?? "",
  };
}

function normalizeFollowUpList(response: FollowUpByAttentionResponse) {
  if (Array.isArray(response)) {
    return response.map(normalizeFollowUp);
  }

  if ("content" in response && Array.isArray(response.content)) {
    return response.content.map(normalizeFollowUp);
  }

  return [];
}

export async function findFollowUpsByAttentionId(attentionId: number) {
  const response = await httpGetFollowUpsByAttentionAPI(attentionId);
  return normalizeFollowUpList(response);
}

export async function findUpcomingFollowUps() {
  const response = await httpGetUpcomingFollowUpsAPI();
  return normalizeFollowUpList(response);
}

export async function createFollowUp(
  attentionId: number,
  payload: CreateFollowUpRequest,
) {
  const response = await httpPostFollowUpAPI(attentionId, payload);
  return normalizeFollowUp(response);
}

export async function completeFollowUp(id: number, result: string) {
  const response = await httpPatchCompleteFollowUpAPI(id, result);
  return normalizeFollowUp(response);
}

export async function cancelFollowUp(id: number) {
  const response = await httpPatchCancelFollowUpAPI(id);
  return normalizeFollowUp(response);
}
