import {
  httpDeleteVeterinarianBlockAPI,
  httpGetVeterinarianBlockByIdAPI,
  httpGetVeterinarianBlocksAPI,
  httpGetVeterinarianBlocksByDateAPI,
  httpPostVeterinarianBlockAPI,
} from "../api/veterinarianBlockHttp";
import {
  VeterinarianBlockItem,
  VeterinarianBlockRequest,
} from "../contracts/veterinarianBlockContract";

export async function findVeterinarianBlocks(veterinarianId: number) {
  return httpGetVeterinarianBlocksAPI(veterinarianId);
}

export async function findVeterinarianBlocksByDate(
  veterinarianId: number,
  fecha: string,
) {
  return httpGetVeterinarianBlocksByDateAPI(veterinarianId, fecha);
}

export async function findVeterinarianBlockById(id: number) {
  return httpGetVeterinarianBlockByIdAPI(id);
}

export async function createVeterinarianBlock(
  payload: VeterinarianBlockRequest,
) {
  return httpPostVeterinarianBlockAPI(payload);
}

export async function deleteVeterinarianBlock(id: number) {
  await httpDeleteVeterinarianBlockAPI(id);
}

export type { VeterinarianBlockItem };
