import {
  httpGetTreatmentPlanByIdAPI,
  httpGetTreatmentPlansByAttentionAPI,
  httpPatchTreatmentPlanStatusAPI,
  httpPostTreatmentPlanAPI,
  httpPutTreatmentPlanAPI,
} from "../api/treatmentPlanHttp";
import {
  CreateTreatmentPlanRequest,
  TreatmentPlanActivityApiItem,
  TreatmentPlanActivityItem,
  TreatmentPlanApiItem,
  TreatmentPlanByAttentionResponse,
  TreatmentPlanItem,
  UpdateTreatmentPlanRequest,
} from "../contracts/treatmentPlanContract";

function normalizeTreatmentPlanActivity(
  activity: TreatmentPlanActivityApiItem,
  index: number,
): TreatmentPlanActivityItem {
  return {
    id: activity.id ?? index + 1,
    tipo: activity.tipo ?? "",
    descripcion: activity.descripcion ?? "",
    fechaProgramada: activity.fechaProgramada ?? "",
    horaProgramada: activity.horaProgramada ?? "",
    frecuencia: activity.frecuencia ?? "",
    responsable: activity.responsable ?? "",
    estado: activity.estado ?? "",
    observaciones: activity.observaciones ?? "",
  };
}

function normalizeTreatmentPlan(item: TreatmentPlanApiItem): TreatmentPlanItem {
  return {
    id: item.id,
    mascotaId: item.mascotaId ?? 0,
    mascotaNombre: item.mascotaNombre ?? "",
    atencionClinicaId: item.atencionClinicaId ?? 0,
    veterinarioId: item.veterinarioId ?? 0,
    veterinarioNombre: item.veterinarioNombre ?? "",
    titulo: item.titulo ?? "",
    descripcion: item.descripcion ?? "",
    fechaInicio: item.fechaInicio ?? "",
    fechaFinEstimada: item.fechaFinEstimada ?? "",
    estado: item.estado ?? "",
    createdBy: item.createdBy ?? 0,
    createdAt: item.createdAt ?? "",
    actividades: (item.actividades ?? []).map(normalizeTreatmentPlanActivity),
  };
}

function normalizeTreatmentPlanList(response: TreatmentPlanByAttentionResponse) {
  if (Array.isArray(response)) {
    return response.map(normalizeTreatmentPlan);
  }

  if ("content" in response && Array.isArray(response.content)) {
    return response.content.map(normalizeTreatmentPlan);
  }

  return [];
}

export async function findTreatmentPlansByAttentionId(attentionId: number) {
  const response = await httpGetTreatmentPlansByAttentionAPI(attentionId);
  return normalizeTreatmentPlanList(response);
}

export async function findTreatmentPlanById(id: number) {
  const response = await httpGetTreatmentPlanByIdAPI(id);
  return normalizeTreatmentPlan(response);
}

export async function createTreatmentPlan(
  attentionId: number,
  payload: CreateTreatmentPlanRequest,
) {
  const response = await httpPostTreatmentPlanAPI(attentionId, payload);
  return normalizeTreatmentPlan(response);
}

export async function updateTreatmentPlan(
  id: number,
  payload: UpdateTreatmentPlanRequest,
) {
  const response = await httpPutTreatmentPlanAPI(id, payload);
  return normalizeTreatmentPlan(response);
}

export async function updateTreatmentPlanStatus(id: number, status: string) {
  const response = await httpPatchTreatmentPlanStatusAPI(id, status);
  return normalizeTreatmentPlan(response);
}
