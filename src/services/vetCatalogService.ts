import {
  httpGetVetServicesAPI,
  httpPostVetServiceAPI,
} from "../api/vetServicesHttp";
import {
  CreateVetServiceRequest,
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
