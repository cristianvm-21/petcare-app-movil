/* => Aquí solo haces la petición HTTP al backend. */
import { springbootApi } from "./axiosHttp";
import { PageRequest } from "../contracts/PageRequestContract"
import {
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
