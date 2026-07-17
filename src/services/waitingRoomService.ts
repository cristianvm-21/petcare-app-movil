import {
  httpGetWaitingRoomAPI,
  httpGetWaitingRoomByStatusAPI,
  httpPatchWaitingRoomStatusAPI,
  httpPostWaitingRoomAPI,
} from "../api/waitingRoomHttp";
import {
  CreateWaitingRoomRequest,
  UpdateWaitingRoomStatusRequest,
  WaitingRoomItem,
} from "../contracts/waitingRoomContract";

export async function findWaitingRoomEntries() {
  const response = await httpGetWaitingRoomAPI();
  return response.content ?? [];
}

export async function findWaitingRoomEntriesByStatus(status: string) {
  const response = await httpGetWaitingRoomByStatusAPI(status);
  return response.content ?? [];
}

export async function createWaitingRoomEntry(
  payload: CreateWaitingRoomRequest,
) {
  return httpPostWaitingRoomAPI(payload);
}

export async function updateWaitingRoomStatus(
  id: number,
  payload: UpdateWaitingRoomStatusRequest,
) {
  return httpPatchWaitingRoomStatusAPI(id, payload);
}

export type { WaitingRoomItem };
