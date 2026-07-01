import { httpGetVetServicesAPI } from "../api/vetServicesHttp";
import { VetServiceResponse } from "../contracts/vetServiceContract";

export async function findAllVetServices() {
  const response: VetServiceResponse = await httpGetVetServicesAPI();
  return response.content ?? [];
}
