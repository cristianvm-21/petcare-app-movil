export interface VeterinarianBlockItem {
  id: number;
  veterinarianId: number;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface VeterinarianBlockRequest {
  veterinarianId: number;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}
