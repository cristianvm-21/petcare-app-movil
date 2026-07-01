/* => Aquí solo haces la petición HTTP al backend. */
import { springbootApi } from "./axiosHttp";
import { VetServicePageRequest } from "../contracts/pageRequestContract";
import {
    VetServiceItem,
    VetServiceResponse,
} from "../contracts/vetServiceContract";

const defaultVetServicesPageRequest: VetServicePageRequest = {
    page: 0,
    size: 100,
};

export async function httpGetVetServicesAPI() {
    const response = await springbootApi.get<VetServiceResponse | VetServiceItem[]>("servicios", {
        params: defaultVetServicesPageRequest,
    });
    return response.data;
}
