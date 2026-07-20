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
  VetServiceApiItem,
  VetServiceItem,
  VetServiceResponse,
} from "../contracts/vetServiceContract";

function normalizeVetService(service: VetServiceApiItem): VetServiceItem {
  return {
    id: service.id,
    nombre: service.name,
    descripcion: service.description,
    duracionMinutos: service.durationMinutes,
    costoReferencial: service.referenceCost,
    activo: service.active,
  };
}

export async function findAllVetServices(filters?: GetVetServicesFilters) {
  const response: VetServiceResponse = await httpGetVetServicesAPI(filters);
  return (response.content ?? []).map(normalizeVetService);
}

export async function findVetServiceById(id: number) {
  const response: VetServiceApiItem = await httpGetVetServiceByIdAPI(id);
  return normalizeVetService(response);
}

export async function createVetService(
  payload: CreateVetServiceRequest,
) {
  const response: VetServiceApiItem = await httpPostVetServiceAPI(payload);
  return normalizeVetService(response);
}

export async function updateVetService(
  id: number,
  payload: UpdateVetServiceRequest,
) {
  const response: VetServiceApiItem = await httpPutVetServiceAPI(id, payload);
  return normalizeVetService(response);
}

export async function toggleVetServiceStatus(id: number) {
  const response: VetServiceApiItem = await httpPatchVetServiceAPI(id);
  return normalizeVetService(response);
}

export async function deleteVetService(id: number) {
  await httpDeleteVetServiceAPI(id);
}
