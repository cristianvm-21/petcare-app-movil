import { httpGetVetServicesAPI } from "../api/vetServicesHttp";
import { VetServiceItem, VetServiceResponse } from "../contracts/vetServiceContract";

function normalizeServices(payload: VetServiceResponse | VetServiceItem[]) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.content)) {
    return payload.content;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.servicios)) {
    return payload.servicios;
  }

  return [];
}

export async function findAllVetServices() {
  const response = await httpGetVetServicesAPI();
  return normalizeServices(response);
}
