export interface VeterinarianAvailabilityItem {
  id: number;
  veterinarianId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface VeterinarianAvailabilityRequest {
  veterinarianId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}
