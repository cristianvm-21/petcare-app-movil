import {
  httpDeleteVeterinarianAvailabilityAPI,
  httpGetVeterinarianAvailabilityAPI,
  httpGetVeterinarianAvailabilityByIdAPI,
  httpPatchVeterinarianAvailabilityAPI,
  httpPostVeterinarianAvailabilityAPI,
  httpPutVeterinarianAvailabilityAPI,
} from "../api/veterinarianAvailabilityHttp";
import {
  VeterinarianAvailabilityItem,
  VeterinarianAvailabilityRequest,
} from "../contracts/veterinarianAvailabilityContract";

export async function findVeterinarianAvailability(veterinarianId: number) {
  return httpGetVeterinarianAvailabilityAPI(veterinarianId);
}

export async function findVeterinarianAvailabilityById(id: number) {
  return httpGetVeterinarianAvailabilityByIdAPI(id);
}

export async function createVeterinarianAvailability(
  payload: VeterinarianAvailabilityRequest,
) {
  return httpPostVeterinarianAvailabilityAPI(payload);
}

export async function updateVeterinarianAvailability(
  id: number,
  payload: VeterinarianAvailabilityRequest,
) {
  return httpPutVeterinarianAvailabilityAPI(id, payload);
}

export async function toggleVeterinarianAvailability(id: number) {
  return httpPatchVeterinarianAvailabilityAPI(id);
}

export async function deleteVeterinarianAvailability(id: number) {
  await httpDeleteVeterinarianAvailabilityAPI(id);
}

export type { VeterinarianAvailabilityItem };
