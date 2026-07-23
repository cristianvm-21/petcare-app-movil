import {
  httpGetPrescriptionByIdAPI,
  httpGetPrescriptionsByAttentionAPI,
  httpPostPrescriptionAPI,
  httpPutPrescriptionAPI,
} from "../api/prescriptionHttp";
import {
  CreatePrescriptionRequest,
  PrescriptionApiDetailItem,
  PrescriptionApiItem,
  PrescriptionByAttentionResponse,
  PrescriptionDetailItem,
  PrescriptionItem,
  UpdatePrescriptionRequest,
} from "../contracts/prescriptionContract";

function normalizePrescriptionDetail(
  detail: PrescriptionApiDetailItem,
  index: number,
): PrescriptionDetailItem {
  return {
    id: detail.id ?? index + 1,
    medicamento: detail.medicamento ?? "",
    presentacion: detail.presentacion ?? "",
    dosis: detail.dosis ?? "",
    frecuencia: detail.frecuencia ?? "",
    duracion: detail.duracion ?? "",
    viaAdministracion: detail.viaAdministracion ?? "",
    indicaciones: detail.indicaciones ?? "",
  };
}

function normalizePrescription(item: PrescriptionApiItem): PrescriptionItem {
  return {
    id: item.id,
    atencionClinicaId: item.atencionClinicaId ?? 0,
    mascotaId: item.mascotaId ?? 0,
    mascotaNombre: item.mascotaNombre ?? "",
    veterinarioId: item.veterinarioId ?? 0,
    veterinarioNombre: item.veterinarioNombre ?? "",
    diagnostico: item.diagnostico ?? "",
    notasAdicionales: item.notasAdicionales ?? "",
    estado: item.estado ?? "",
    createdBy: item.createdBy ?? 0,
    createdAt: item.createdAt ?? "",
    detalles: (item.detalles ?? []).map(normalizePrescriptionDetail),
  };
}

function normalizePrescriptionList(response: PrescriptionByAttentionResponse) {
  if (Array.isArray(response)) {
    return response.map(normalizePrescription);
  }

  if ("content" in response && Array.isArray(response.content)) {
    return response.content.map(normalizePrescription);
  }

  return [];
}

export async function findPrescriptionsByAttentionId(attentionId: number) {
  const response = await httpGetPrescriptionsByAttentionAPI(attentionId);
  return normalizePrescriptionList(response);
}

export async function findPrescriptionById(id: number) {
  const response = await httpGetPrescriptionByIdAPI(id);
  return normalizePrescription(response);
}

export async function createPrescription(
  attentionId: number,
  payload: CreatePrescriptionRequest,
) {
  const response = await httpPostPrescriptionAPI(attentionId, payload);
  return normalizePrescription(response);
}

export async function updatePrescription(
  id: number,
  payload: UpdatePrescriptionRequest,
) {
  const response = await httpPutPrescriptionAPI(id, payload);
  return normalizePrescription(response);
}
