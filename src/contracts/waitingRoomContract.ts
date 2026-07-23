export interface WaitingRoomItem {
  id: number;
  appointmentId: number;
  petId: number;
  arrivalDate: string;
  status: string;
  observations: string;
}

export interface CreateWaitingRoomRequest {
  appointmentId: number;
  observations: string;
}

export interface UpdateWaitingRoomStatusRequest {
  status: string;
}

export interface WaitingRoomApiItem {
  id: number;
  appointmentId?: number;
  petId?: number;
  arrivalDate?: string;
  status?: string;
  observations?: string | null;
}

export interface WaitingRoomResponse {
  content: WaitingRoomApiItem[];
}
