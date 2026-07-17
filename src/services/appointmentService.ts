import {
  httpDeleteAppointmentAPI,
  httpGetAppointmentAPI,
  httpGetAppointmentAvailabilityAPI,
  httpGetAppointmentByIdAPI,
  httpGetAppointmentsByPetIdAPI,
  httpGetAppointmentsByVeterinarianIdAPI,
  httpPostAppointmentAPI,
  httpPutAppointmentRescheduleAPI,
  httpPutAppointmentStatusAPI,
} from "../api/appointmentHttp";
import {
  AppointmentAvailabilityApiItem,
  AppointmentApiItem,
  AppointmentApiPetItem,
  AppointmentApiResponse,
  AppointmentAvailabilityResponse,
  AppointmentApiServiceItem,
  AppointmentApiUserItem,
  AppointmentAvailabilityItem,
  AppointmentItem,
  CreateAppointmentRequest,
  GetAppointmentsFilters,
  ReprogramAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from "../contracts/appointmentContract";
import { PetItem } from "../contracts/petContract";
import { VetServiceItem } from "../contracts/vetServiceContract";

function normalizeAppointmentPet(pet: AppointmentApiPetItem): PetItem {
  return {
    id: pet.id,
    nombre: pet.nombre ?? pet.name ?? "",
    especie: pet.especie ?? pet.species ?? "",
    raza: pet.raza ?? pet.breed ?? "",
    sexo: pet.sexo ?? pet.gender ?? "",
    fechaNacimiento: pet.fechaNacimiento ?? pet.birthDate ?? "",
    microchip: pet.microchip ?? "",
    condicionReproductiva:
      pet.condicionReproductiva ?? pet.reproductiveCondition ?? "",
    alergias: pet.alergias ?? pet.allergies ?? "",
    enfermedadesCronicas:
      pet.enfermedadesCronicas ?? pet.chronicDiseases ?? "",
    alertasMedicas: pet.alertasMedicas ?? pet.medicalAlerts ?? "",
    activo: pet.activo ?? pet.active ?? false,
  };
}

function normalizeAppointmentUser(user: AppointmentApiUserItem) {
  return {
    id: user.id,
    username: user.username,
    password: user.password ?? "",
    nombre: user.nombre ?? user.firstName ?? "",
    apellido: user.apellido ?? user.lastName ?? "",
    email: user.email,
    telefono: user.telefono ?? user.phone ?? "",
    rol: user.rol ?? user.role ?? "ASISTENTE",
    activo: user.activo ?? user.active ?? false,
  };
}

function normalizeAppointmentService(
  service: AppointmentApiServiceItem,
): VetServiceItem {
  return {
    id: service.id,
    nombre: service.nombre ?? service.name ?? "",
    descripcion: service.descripcion ?? service.description ?? "",
    duracionMinutos:
      service.duracionMinutos ?? service.durationMinutes ?? 0,
    costoReferencial:
      service.costoReferencial ?? service.referenceCost ?? 0,
    activo: service.activo ?? service.active ?? false,
  };
}

function normalizeAppointment(appointment: AppointmentApiItem): AppointmentItem {
  const petId = appointment.mascota?.id ?? appointment.petId ?? 0;
  const veterinarianId =
    appointment.veterinario?.id ?? appointment.veterinarianId ?? 0;
  const serviceId = appointment.servicio?.id ?? appointment.serviceId ?? 0;
  const createdById =
    typeof appointment.createdBy === "number"
      ? appointment.createdBy
      : appointment.createdBy?.id ?? appointment.creadoPor?.id ?? 0;

  return {
    id: appointment.id,
    mascota: normalizeAppointmentPet(
      appointment.mascota ?? {
        id: petId,
      },
    ),
    veterinario: normalizeAppointmentUser(
      appointment.veterinario ?? {
        id: veterinarianId,
        username: "",
        email: "",
      },
    ),
    servicio: normalizeAppointmentService(
      appointment.servicio ?? {
        id: serviceId,
      },
    ),
    fechaHora: appointment.fechaHora ?? appointment.dateTime ?? "",
    estado: appointment.estado ?? appointment.status ?? "",
    notas: appointment.notas ?? appointment.notes ?? "",
    creadoPor: normalizeAppointmentUser(
      typeof appointment.createdBy === "object"
        ? appointment.createdBy
        : appointment.creadoPor ?? {
            id: createdById,
            username: "",
            email: "",
          },
    ),
    creadoEn: appointment.creadoEn ?? appointment.createdAt ?? "",
    actualizadoEn: appointment.actualizadoEn ?? appointment.updatedAt ?? "",
  };
}

function normalizeAppointmentList(response: AppointmentApiResponse) {
  return (response.content ?? []).map(normalizeAppointment);
}

function normalizeAvailabilityItem(
  item: AppointmentAvailabilityApiItem,
): AppointmentAvailabilityItem {
  if (typeof item === "string") {
    return {
      dateTime: item,
    };
  }

  return {
    dateTime: item.dateTime,
  };
}

export async function findAllAppointments(filters?: GetAppointmentsFilters) {
  const response: AppointmentApiResponse = await httpGetAppointmentAPI(filters);
  return normalizeAppointmentList(response);
}

export async function findAppointmentById(id: number) {
  const response: AppointmentApiItem = await httpGetAppointmentByIdAPI(id);
  return normalizeAppointment(response);
}

export async function findAppointmentsByPetId(petId: number) {
  const response: AppointmentApiResponse =
    await httpGetAppointmentsByPetIdAPI(petId);
  return normalizeAppointmentList(response);
}

export async function findAppointmentsByVeterinarianId(veterinarianId: number) {
  const response: AppointmentApiResponse =
    await httpGetAppointmentsByVeterinarianIdAPI(veterinarianId);
  return normalizeAppointmentList(response);
}

export async function findAppointmentAvailability(params: {
  veterinarioId: number;
  servicioId: number;
  fecha: string;
}) {
  const response:
    | AppointmentAvailabilityItem[]
    | AppointmentAvailabilityResponse =
    await httpGetAppointmentAvailabilityAPI(params);

  const items = Array.isArray(response)
    ? response
    : Array.isArray(response.availableSlots)
      ? response.availableSlots
    : Array.isArray(response.content)
      ? response.content
      : [];

  return items.map(normalizeAvailabilityItem);
}

export async function createAppointment(payload: CreateAppointmentRequest) {
  const response: AppointmentApiItem = await httpPostAppointmentAPI(payload);
  return normalizeAppointment(response);
}

export async function reprogramAppointment(
  id: number,
  payload: ReprogramAppointmentRequest,
) {
  const response: AppointmentApiItem = await httpPutAppointmentRescheduleAPI(
    id,
    payload,
  );
  return normalizeAppointment(response);
}

export async function updateAppointmentStatus(
  id: number,
  payload: UpdateAppointmentStatusRequest,
) {
  const response: AppointmentApiItem = await httpPutAppointmentStatusAPI(
    id,
    payload,
  );
  return normalizeAppointment(response);
}

export async function deleteAppointment(id: number) {
  await httpDeleteAppointmentAPI(id);
}
