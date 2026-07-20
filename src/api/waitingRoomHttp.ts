import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/pageRequestContract";
import {
  CreateWaitingRoomRequest,
  UpdateWaitingRoomStatusRequest,
  WaitingRoomItem,
} from "../contracts/waitingRoomContract";

const waitingRoomPageRequest: PageRequest = {
  page: 0,
  size: 100,
};

export async function httpGetWaitingRoomAPI() {
  const response = await springbootApi.get<{ content: WaitingRoomItem[] }>(
    "sala-espera",
    {
      params: waitingRoomPageRequest,
    },
  );
  return response.data;
}

export async function httpGetWaitingRoomByStatusAPI(status: string) {
  const response = await springbootApi.get<{ content: WaitingRoomItem[] }>(
    `sala-espera/estado/${status}`,
    {
      params: waitingRoomPageRequest,
    },
  );
  return response.data;
}

export async function httpPostWaitingRoomAPI(
  payload: CreateWaitingRoomRequest,
) {
  const response = await springbootApi.post<WaitingRoomItem>(
    "sala-espera",
    payload,
  );
  return response.data;
}

export async function httpPatchWaitingRoomStatusAPI(
  id: number,
  payload: UpdateWaitingRoomStatusRequest,
) {
  const response = await springbootApi.patch<WaitingRoomItem>(
    `sala-espera/${id}/estado`,
    payload,
  );
  return response.data;
}
