import { springbootApi } from "./axiosHttp";
import {
  VeterinarianAvailabilityItem,
  VeterinarianAvailabilityRequest,
} from "../contracts/veterinarianAvailabilityContract";

export async function httpGetVeterinarianAvailabilityAPI(veterinarianId: number) {
  const response = await springbootApi.get<VeterinarianAvailabilityItem[]>(
    `disponibilidad/veterinario/${veterinarianId}`,
  );
  return response.data;
}

export async function httpGetVeterinarianAvailabilityByIdAPI(id: number) {
  const response = await springbootApi.get<VeterinarianAvailabilityItem>(
    `disponibilidad/${id}`,
  );
  return response.data;
}

export async function httpPostVeterinarianAvailabilityAPI(
  payload: VeterinarianAvailabilityRequest,
) {
  const response = await springbootApi.post<VeterinarianAvailabilityItem>(
    "disponibilidad",
    payload,
  );
  return response.data;
}

export async function httpPutVeterinarianAvailabilityAPI(
  id: number,
  payload: VeterinarianAvailabilityRequest,
) {
  const response = await springbootApi.put<VeterinarianAvailabilityItem>(
    `disponibilidad/${id}`,
    payload,
  );
  return response.data;
}

export async function httpPatchVeterinarianAvailabilityAPI(id: number) {
  const response = await springbootApi.patch<VeterinarianAvailabilityItem>(
    `disponibilidad/${id}/toggle`,
  );
  return response.data;
}

export async function httpDeleteVeterinarianAvailabilityAPI(id: number) {
  await springbootApi.delete(`disponibilidad/${id}`);
}
