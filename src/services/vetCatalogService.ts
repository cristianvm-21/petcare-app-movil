import {
  httpDeleteVetServiceAPI,
  httpGetVetServicesAPI,
  httpPatchVetServiceAPI,
  httpPostVetServiceAPI,
  httpPutVetServiceAPI,
} from "../api/vetServicesHttp";
import {
  CreateVetServiceRequest,
  UpdateVetServiceRequest,
  VetServiceItem,
  VetServiceResponse,
} from "../contracts/vetServiceContract";

export async function findAllVetServices() {
  const response: VetServiceResponse = await httpGetVetServicesAPI();
  return response.content ?? [];
}

export async function createVetService(
  payload: CreateVetServiceRequest,
) {
  const response: VetServiceItem = await httpPostVetServiceAPI(payload);
  return response;
}

export async function updateVetService(
  id: number,
  payload: UpdateVetServiceRequest,
) {
  const response: VetServiceItem = await httpPutVetServiceAPI(id, payload);
  return response;
}

export async function toggleVetServiceStatus(id: number) {
  const response: VetServiceItem = await httpPatchVetServiceAPI(id);
  return response;
}

export async function deleteVetService(id: number) {
  await httpDeleteVetServiceAPI(id);
}
