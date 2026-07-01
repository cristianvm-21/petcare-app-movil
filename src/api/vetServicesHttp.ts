/* => Aquí solo haces la petición HTTP al backend. */
import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/PageRequestContract";
import {
    CreateVetServiceRequest,
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
