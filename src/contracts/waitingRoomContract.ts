export interface WaitingRoomItem {
  id: number;
  appointmentId: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWaitingRoomRequest {
  appointmentId: number;
}

export interface UpdateWaitingRoomStatusRequest {
  status: string;
}
