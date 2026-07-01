/* => Aquí solo haces la petición HTTP al backend. */
import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/pageRequestContract";
import {
    CreateVetServiceRequest,
    UpdateVetServiceRequest,
    VetServiceItem,
    VetServiceResponse,
} from "../contracts/vetServiceContract";

const VetServicePageRequest: PageRequest = {
    page: 0,
    size: 100,
};

export async function httpGetVetServicesAPI() {
    const response = await springbootApi.get<VetServiceResponse>("servicios", {
        params: VetServicePageRequest,
    });
    return response.data;
}

export async function httpPostVetServiceAPI(
    payload: CreateVetServiceRequest,
) {
    const response = await springbootApi.post<VetServiceItem>("servicios", payload);
    return response.data;
}

export async function httpPutVetServiceAPI(
    id: number,
    payload: UpdateVetServiceRequest,
) {
    const response = await springbootApi.put<VetServiceItem>(`servicios/${id}`, payload);
    return response.data;
}

export async function httpPatchVetServiceAPI(id: number) {
    const response = await springbootApi.patch<VetServiceItem>(`servicios/${id}/toggle`);
    return response.data;
}

export async function httpDeleteVetServiceAPI(id: number) {
    await springbootApi.delete(`servicios/${id}`);
}
