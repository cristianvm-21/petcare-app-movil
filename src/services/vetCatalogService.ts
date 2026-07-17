import {
  httpDeleteVetServiceAPI,
  httpGetVetServiceByIdAPI,
  httpGetVetServicesAPI,
  httpPatchVetServiceAPI,
  httpPostVetServiceAPI,
  httpPutVetServiceAPI,
} from "../api/vetServicesHttp";
import {
  CreateVetServiceRequest,
  GetVetServicesFilters,
  UpdateVetServiceRequest,
  VetServiceItem,
  VetServiceResponse,
} from "../contracts/vetServiceContract";

export async function findAllVetServices(filters?: GetVetServicesFilters) {
  const response: VetServiceResponse = await httpGetVetServicesAPI(filters);
  return response.content ?? [];
}

export async function findVetServiceById(id: number) {
  const response: VetServiceItem = await httpGetVetServiceByIdAPI(id);
  return response;
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
