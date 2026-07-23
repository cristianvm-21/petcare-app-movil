import {
  httpGetWaitingRoomAPI,
  httpGetWaitingRoomByStatusAPI,
  httpPatchWaitingRoomStatusAPI,
  httpPostWaitingRoomAPI,
} from "../api/waitingRoomHttp";
import {
  WaitingRoomApiItem,
  CreateWaitingRoomRequest,
  UpdateWaitingRoomStatusRequest,
  WaitingRoomItem,
} from "../contracts/waitingRoomContract";

function normalizeWaitingRoomEntry(item: WaitingRoomApiItem): WaitingRoomItem {
  return {
    id: item.id,
    appointmentId: item.appointmentId ?? 0,
    petId: item.petId ?? 0,
    arrivalDate: item.arrivalDate ?? "",
    status: item.status ?? "",
    observations: item.observations ?? "",
  };
}

export async function findWaitingRoomEntries() {
  const response = await httpGetWaitingRoomAPI();
  return (response.content ?? []).map(normalizeWaitingRoomEntry);
}

export async function findWaitingRoomEntriesByStatus(status: string) {
  const response = await httpGetWaitingRoomByStatusAPI(status);
  return (response.content ?? []).map(normalizeWaitingRoomEntry);
}

export async function createWaitingRoomEntry(
  payload: CreateWaitingRoomRequest,
) {
  const response = await httpPostWaitingRoomAPI(payload);
  return normalizeWaitingRoomEntry(response);
}

export async function updateWaitingRoomStatus(
  id: number,
  payload: UpdateWaitingRoomStatusRequest,
) {
  const response = await httpPatchWaitingRoomStatusAPI(id, payload);
  return normalizeWaitingRoomEntry(response);
}

export type { WaitingRoomItem };
