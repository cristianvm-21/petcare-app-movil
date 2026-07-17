import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/pageRequestContract";
import {
  CreateVetServiceRequest,
  GetVetServicesFilters,
  UpdateVetServiceRequest,
  VetServiceApiItem,
  VetServiceResponse,
} from "../contracts/vetServiceContract";

const vetServicePageRequest: PageRequest = {
  page: 0,
  size: 100,
};

type GetVetServicesParams = Partial<PageRequest> & GetVetServicesFilters;

export async function httpGetVetServicesAPI(params?: GetVetServicesParams) {
  const response = await springbootApi.get<VetServiceResponse>("servicios", {
    params: {
      ...vetServicePageRequest,
      ...params,
    },
  });
  return response.data;
}

export async function httpGetVetServiceByIdAPI(id: number) {
  const response = await springbootApi.get<VetServiceApiItem>(`servicios/${id}`);
  return response.data;
}

export async function httpPostVetServiceAPI(
  payload: CreateVetServiceRequest,
) {
  const response = await springbootApi.post<VetServiceApiItem>("servicios", payload);
  return response.data;
}

export async function httpPutVetServiceAPI(
  id: number,
  payload: UpdateVetServiceRequest,
) {
  const response = await springbootApi.put<VetServiceApiItem>(
    `servicios/${id}`,
    payload,
  );
  return response.data;
}

export async function httpPatchVetServiceAPI(id: number) {
  const response = await springbootApi.patch<VetServiceApiItem>(`servicios/${id}/toggle`);
  return response.data;
}

export async function httpDeleteVetServiceAPI(id: number) {
  await springbootApi.delete(`servicios/${id}`);
}
