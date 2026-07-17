import { springbootApi } from "./axiosHttp";
import {
  VeterinarianBlockItem,
  VeterinarianBlockRequest,
} from "../contracts/veterinarianBlockContract";

export async function httpGetVeterinarianBlocksAPI(veterinarianId: number) {
  const response = await springbootApi.get<VeterinarianBlockItem[]>(
    `bloqueos/veterinario/${veterinarianId}`,
  );
  return response.data;
}

export async function httpGetVeterinarianBlocksByDateAPI(
  veterinarianId: number,
  fecha: string,
) {
  const response = await springbootApi.get<VeterinarianBlockItem[]>(
    `bloqueos/veterinario/${veterinarianId}/fecha`,
    {
      params: { fecha },
    },
  );
  return response.data;
}

export async function httpGetVeterinarianBlockByIdAPI(id: number) {
  const response = await springbootApi.get<VeterinarianBlockItem>(
    `bloqueos/${id}`,
  );
  return response.data;
}

export async function httpPostVeterinarianBlockAPI(
  payload: VeterinarianBlockRequest,
) {
  const response = await springbootApi.post<VeterinarianBlockItem>(
    "bloqueos",
    payload,
  );
  return response.data;
}

export async function httpDeleteVeterinarianBlockAPI(id: number) {
  await springbootApi.delete(`bloqueos/${id}`);
}
