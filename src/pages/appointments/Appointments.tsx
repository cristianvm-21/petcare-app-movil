import {
  IonButton,
  IonContent,
  IonDatetime,
  IonIcon,
  IonInput,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
} from "@ionic/react";
import { AxiosError } from "axios";
import {
  addOutline,
  calendarOutline,
  closeOutline,
  eyeOutline,
  pencilOutline,
  trashOutline,
} from "ionicons/icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import AppHeader from "../../components/AppHeader/AppHeader";
import {
  AppointmentItem,
  AppointmentAvailabilityItem,
  CreateAppointmentRequest,
  GetAppointmentsFilters,
  ReprogramAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from "../../contracts/appointmentContract";
import { PetItem } from "../../contracts/petContract";
import { VetServiceItem } from "../../contracts/vetServiceContract";
import { UserItem } from "../../contracts/userContract";
import {
  createAppointment,
  deleteAppointment,
  findAllAppointments,
  findAppointmentAvailability,
  findAppointmentById,
  reprogramAppointment,
  updateAppointmentStatus,
} from "../../services/appointmentService";
import { findAllPets } from "../../services/petService";
import { findVeterinarians } from "../../services/userService";
import { findAllVetServices } from "../../services/vetCatalogService";
import "./Appointments.css";

const initialFormData: CreateAppointmentRequest = {
  petId: 0,
  veterinarianId: 0,
  serviceId: 0,
  dateTime: "",
  notes: "",
};

const APPOINTMENT_TIME_ZONE = "America/Lima";
const APPOINTMENT_UTC_OFFSET = "-05:00";

function hasExplicitTimeZone(value: string) {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value.trim());
}

function normalizeDateTimeWithAppointmentOffset(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  return hasExplicitTimeZone(trimmedValue)
    ? trimmedValue
    : `${trimmedValue}${APPOINTMENT_UTC_OFFSET}`;
}

function getAppointmentDateParts(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APPOINTMENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second"),
  };
}

function formatDateTime(value: string) {
  return new Date(normalizeDateTimeWithAppointmentOffset(value)).toLocaleString("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: APPOINTMENT_TIME_ZONE,
  });
}

function isTimeOnlySlot(value: string) {
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value.trim());
}

function buildDateTimeFromSlot(slotValue: string, selectedDate: string) {
  const trimmedSlot = slotValue.trim();

  if (!trimmedSlot) {
    return "";
  }

  if (isTimeOnlySlot(trimmedSlot)) {
    const normalizedTime =
      trimmedSlot.length === 5 ? `${trimmedSlot}:00` : trimmedSlot;
    return `${selectedDate}T${normalizedTime}`;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmedSlot)) {
    return trimmedSlot.length === 16 ? `${trimmedSlot}:00` : trimmedSlot;
  }

  return trimmedSlot;
}

function formatTimeOnlySlot(value: string) {
  const match = value.trim().match(/^(\d{2}):(\d{2})(?::\d{2})?$/);

  if (!match) {
    return value;
  }

  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? "p. m." : "a. m.";
  const normalizedHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${normalizedHour}:${minutes} ${suffix}`;
}

function formatAvailableSlot(slotValue: string, selectedDate: string) {
  const normalizedValue = buildDateTimeFromSlot(slotValue, selectedDate);

  if (!normalizedValue) {
    return slotValue;
  }

  if (isTimeOnlySlot(slotValue)) {
    return formatTimeOnlySlot(slotValue);
  }

  const parsedDate = new Date(normalizedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return slotValue;
  }

  return formatDateTime(normalizedValue);
}

function toApiDateTime(value: string) {
  if (!value.trim()) {
    return "";
  }

  if (!hasExplicitTimeZone(value)) {
    return value.length === 16 ? `${value}:00` : value;
  }

  const parts = getAppointmentDateParts(value);

  if (!parts) {
    return value;
  }

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

function toInputDateTime(value: string) {
  const parts = getAppointmentDateParts(value);

  if (!parts) {
    return "";
  }

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function toDatetimeValue(value: string) {
  if (!value) {
    return undefined;
  }

  if (!hasExplicitTimeZone(value)) {
    return value;
  }

  return new Date(value).toISOString();
}

function formatDateTimePickerValue(value: string, placeholder: string) {
  if (!value) {
    return placeholder;
  }

  return new Date(normalizeDateTimeWithAppointmentOffset(value)).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: APPOINTMENT_TIME_ZONE,
  });
}

function formatDatePickerValue(value: string, placeholder: string) {
  if (!value) {
    return placeholder;
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("es-PE", {
    dateStyle: "medium",
  });
}

function toDateOnlyValue(value: string) {
  if (!value) {
    return undefined;
  }

  return `${value}T00:00:00`;
}

function getAppointmentErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  const backendMessage =
    (typeof error.response?.data === "object" &&
      error.response?.data !== null &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string" &&
      error.response.data.message) ||
    (typeof error.response?.data === "string" ? error.response.data : "");

  if (error.response?.status === 409) {
    return (
      backendMessage ||
      "La cita entra en conflicto con la disponibilidad actual. Elige otro horario."
    );
  }

  if (error.response?.status === 400) {
    return backendMessage || "Los datos de la cita no son válidos.";
  }

  return backendMessage || fallback;
}

function getVetFullName(vet: UserItem) {
  return `${vet.firstName} ${vet.lastName}`.trim();
}

function getAppointmentPetName(appointment: AppointmentItem, pets: PetItem[]) {
  return (
    appointment.mascota.nombre ||
    pets.find((pet) => pet.id === appointment.mascota.id)?.nombre ||
    `Mascota #${appointment.mascota.id}`
  );
}

function getAppointmentServiceName(
  appointment: AppointmentItem,
  services: VetServiceItem[],
) {
  return (
    appointment.servicio.nombre ||
    services.find((service) => service.id === appointment.servicio.id)?.nombre ||
    `Servicio #${appointment.servicio.id}`
  );
}

function getAppointmentVeterinarianName(
  appointment: AppointmentItem,
  veterinarians: UserItem[],
) {
  const fullName = `${appointment.veterinario.nombre} ${appointment.veterinario.apellido}`.trim();

  if (fullName.length > 0) {
    return fullName;
  }

  const veterinarian = veterinarians.find(
    (vet) => vet.id === appointment.veterinario.id,
  );

  if (!veterinarian) {
    return `Veterinario #${appointment.veterinario.id}`;
  }

  return getVetFullName(veterinarian) || veterinarian.username;
}

function getAppointmentCreatorName(appointment: AppointmentItem) {
  const fullName = `${appointment.creadoPor.nombre} ${appointment.creadoPor.apellido}`.trim();
  return fullName || `Usuario #${appointment.creadoPor.id}`;
}

function getAppointmentStatusClass(status: string) {
  switch (status) {
    case "CANCELADA":
      return "appointments-status appointments-status--cancelled";
    case "CONFIRMADA":
      return "appointments-status appointments-status--confirmed";
    case "ATENDIDA":
      return "appointments-status appointments-status--attended";
    default:
      return "appointments-status";
  }
}

function buildAppointmentFilters(params: {
  veterinarianFilter: string;
  serviceFilter: string;
  statusFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
}): GetAppointmentsFilters {
  return {
    veterinarioId:
      params.veterinarianFilter !== "0"
        ? Number(params.veterinarianFilter)
        : undefined,
    servicioId:
      params.serviceFilter !== "0" ? Number(params.serviceFilter) : undefined,
    estado: params.statusFilter !== "todos" ? params.statusFilter : undefined,
    fechaDesde: params.dateFromFilter || undefined,
    fechaHasta: params.dateToFilter || undefined,
  };
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [pets, setPets] = useState<PetItem[]>([]);
  const [veterinarians, setVeterinarians] = useState<UserItem[]>([]);
  const [services, setServices] = useState<VetServiceItem[]>([]);
  const [query, setQuery] = useState("");
  const [veterinarianFilter, setVeterinarianFilter] = useState("0");
  const [serviceFilter, setServiceFilter] = useState("0");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<CreateAppointmentRequest>(initialFormData);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUpdatingAppointment, setIsUpdatingAppointment] = useState(false);
  const [editDateTime, setEditDateTime] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AppointmentAvailabilityItem[]>([]);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [isCreateDateModalOpen, setIsCreateDateModalOpen] = useState(false);
  const [isEditDateModalOpen, setIsEditDateModalOpen] = useState(false);
  const detailSectionRef = useRef<HTMLElement | null>(null);

  async function loadAppointments(filters?: GetAppointmentsFilters) {
    try {
      setIsLoading(true);
      setError("");

      const appointmentsData = await findAllAppointments(filters);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error("No se pudieron cargar las citas:", err);
      setError("No se pudieron cargar las citas del backend.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadFormDependencies() {
    try {
      const [petsData, vetsData, servicesData] = await Promise.all([
        findAllPets(),
        findVeterinarians(),
        findAllVetServices(),
      ]);

      setPets(petsData.filter((pet) => pet.activo));
      setVeterinarians(vetsData.filter((vet) => vet.active));
      setServices(servicesData.filter((service) => service.activo));
    } catch (err) {
      console.error("No se pudieron cargar los datos del formulario:", err);
      setError("No se pudieron cargar mascotas, veterinarios o servicios.");
    }
  }

  useEffect(() => {
    void loadFormDependencies();
  }, []);

  useEffect(() => {
    const filters = buildAppointmentFilters({
      veterinarianFilter,
      serviceFilter,
      statusFilter,
      dateFromFilter,
      dateToFilter,
    });

    void loadAppointments(filters);
  }, [veterinarianFilter, serviceFilter, statusFilter, dateFromFilter, dateToFilter]);

  useEffect(() => {
    async function loadAvailability() {
      if (
        formData.veterinarianId <= 0 ||
        formData.serviceId <= 0 ||
        !selectedAppointmentDate.trim()
      ) {
        setAvailableSlots([]);
        setAvailabilityError("");
        return;
      }

      try {
        setIsAvailabilityLoading(true);
        setAvailabilityError("");

        const slots = await findAppointmentAvailability({
          veterinarioId: formData.veterinarianId,
          servicioId: formData.serviceId,
          fecha: selectedAppointmentDate,
        });

        setAvailableSlots(slots);
      } catch (err) {
        console.error("No se pudo consultar la disponibilidad:", err);
        setAvailableSlots([]);
        setAvailabilityError(
          "No se pudo consultar la disponibilidad del veterinario.",
        );
      } finally {
        setIsAvailabilityLoading(false);
      }
    }

    void loadAvailability();
  }, [formData.veterinarianId, formData.serviceId, selectedAppointmentDate]);

  useEffect(() => {
    if (!selectedAppointment && !isDetailLoading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      detailSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [selectedAppointment, isDetailLoading, isEditMode]);

  function updateField<K extends keyof CreateAppointmentRequest>(
    field: K,
    value: CreateAppointmentRequest[K],
  ) {
    setFormError("");
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setFormData(initialFormData);
    setSelectedAppointmentDate("");
    setAvailableSlots([]);
    setAvailabilityError("");
    setFormError("");
    setIsFormVisible(false);
    setIsCreateDateModalOpen(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      formData.petId <= 0 ||
      formData.veterinarianId <= 0 ||
      formData.serviceId <= 0 ||
      !formData.dateTime.trim()
    ) {
      setFormError(
        "Completa mascota, veterinario, servicio, fecha y selecciona un horario disponible.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      await createAppointment({
        ...formData,
        dateTime: toApiDateTime(formData.dateTime),
      });

      resetForm();
      await loadAppointments(
        buildAppointmentFilters({
          veterinarianFilter,
          serviceFilter,
          statusFilter,
          dateFromFilter,
          dateToFilter,
        }),
      );
    } catch (err) {
      console.error("No se pudo registrar la cita:", err);
      setFormError(
        getAppointmentErrorMessage(
          err,
          "No se pudo registrar la cita. Inténtalo nuevamente.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleViewDetails(appointmentId: number) {
    try {
      setIsDetailLoading(true);
      setIsEditMode(false);
      const appointment = await findAppointmentById(appointmentId);
      setSelectedAppointment(appointment);
    } catch (err) {
      console.error("No se pudo cargar el detalle de la cita:", err);
      setError("No se pudo cargar el detalle de la cita.");
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleStartEdit(appointmentId: number) {
    try {
      setIsDetailLoading(true);
      const appointment = await findAppointmentById(appointmentId);
      setSelectedAppointment(appointment);
      setEditDateTime(toInputDateTime(appointment.fechaHora));
      setEditStatus(appointment.estado);
      setIsEditMode(true);
      setFormError("");
    } catch (err) {
      console.error("No se pudo cargar la cita para editar:", err);
      setError("No se pudo cargar la cita para editar.");
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleUpdateAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedAppointment) {
      return;
    }

    if (!editDateTime.trim() || !editStatus.trim()) {
      setError("Completa fecha y estado para actualizar la cita.");
      return;
    }

    const reprogramPayload: ReprogramAppointmentRequest = {
      dateTime: toApiDateTime(editDateTime),
    };
    const statusPayload: UpdateAppointmentStatusRequest = {
      status: editStatus,
    };

    const originalDateTime = toInputDateTime(selectedAppointment.fechaHora);
    const originalStatus = selectedAppointment.estado;
    const shouldReprogram = editDateTime !== originalDateTime;
    const shouldUpdateStatus = editStatus !== originalStatus;

    if (!shouldReprogram && !shouldUpdateStatus) {
      setIsEditMode(false);
      return;
    }

    try {
      setIsUpdatingAppointment(true);
      setError("");

      if (shouldReprogram) {
        await reprogramAppointment(selectedAppointment.id, reprogramPayload);
      }

      if (shouldUpdateStatus) {
        await updateAppointmentStatus(selectedAppointment.id, statusPayload);
      }

      const refreshedAppointment = await findAppointmentById(selectedAppointment.id);
      setSelectedAppointment(refreshedAppointment);
      setEditDateTime(toInputDateTime(refreshedAppointment.fechaHora));
      setEditStatus(refreshedAppointment.estado);
      setIsEditMode(false);
      await loadAppointments(
        buildAppointmentFilters({
          veterinarianFilter,
          serviceFilter,
          statusFilter,
          dateFromFilter,
          dateToFilter,
        }),
      );
    } catch (err) {
      console.error("No se pudo actualizar la cita:", err);
      setError(
        getAppointmentErrorMessage(err, "No se pudo actualizar la cita."),
      );
    } finally {
      setIsUpdatingAppointment(false);
    }
  }

  async function handleDeleteAppointment(appointment: AppointmentItem) {
    const confirmed = window.confirm(
      `¿Deseas eliminar la cita de "${getAppointmentPetName(appointment, pets)}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmittingAction(appointment.id);
      setError("");
      await deleteAppointment(appointment.id);
      setAppointments((current) =>
        current.filter((item) => item.id !== appointment.id),
      );

      if (selectedAppointment?.id === appointment.id) {
        setSelectedAppointment(null);
      }

      await loadAppointments(
        buildAppointmentFilters({
          veterinarianFilter,
          serviceFilter,
          statusFilter,
          dateFromFilter,
          dateToFilter,
        }),
      );
    } catch (err) {
      console.error("No se pudo eliminar la cita:", err);
      setError(
        getAppointmentErrorMessage(err, "No se pudo eliminar la cita."),
      );
    } finally {
      setIsSubmittingAction(null);
    }
  }

  const filteredAppointments = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const petName = getAppointmentPetName(appointment, pets).toLowerCase();
      const veterinarianName = getAppointmentVeterinarianName(
        appointment,
        veterinarians,
      ).toLowerCase();
      const serviceName = getAppointmentServiceName(
        appointment,
        services,
      ).toLowerCase();
      const matchesQuery =
        loweredQuery.length === 0 ||
        petName.includes(loweredQuery) ||
        veterinarianName.includes(loweredQuery) ||
        serviceName.includes(loweredQuery);
      return matchesQuery;
    });
  }, [appointments, pets, query, services, veterinarians]);

  return (
    <IonPage>
      <AppHeader title="Citas" />
      <IonContent>
        <div className="appointments-screen">
          <section className="appointments-hero">
            <div>
              <div className="appointments-hero__title-row">
                <IonIcon icon={calendarOutline} />
                <h1>Citas</h1>
              </div>
              <p>Gestiona las citas programadas entre mascotas, veterinarios y servicios.</p>
            </div>

            <IonButton
              className="appointments-hero__cta"
              onClick={() => {
                setFormError("");
                setFormData(initialFormData);
                setSelectedAppointmentDate("");
                setAvailableSlots([]);
                setAvailabilityError("");
                setIsFormVisible((current) => !current);
              }}
            >
              <IonIcon icon={addOutline} slot="start" />
              Nueva Cita
            </IonButton>
          </section>

          {isFormVisible && (
            <section className="appointments-form-card">
              <div className="appointments-form-card__header">
                <div>
                  <h2>Registrar nueva cita</h2>
                  <p>Selecciona mascota, veterinario, servicio y fecha de atención.</p>
                </div>

                <IonButton
                  aria-label="Cerrar formulario"
                  className="appointments-form-card__close"
                  fill="clear"
                  onClick={resetForm}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              <form className="appointments-form" onSubmit={handleSubmit}>
                <div className="appointments-form__grid">
                  <IonSelect
                    className="appointments-field appointments-field--select"
                    interface="popover"
                    value={formData.petId || undefined}
                    placeholder="Selecciona una mascota"
                    onIonChange={(event) =>
                      updateField("petId", Number(event.detail.value ?? 0))
                    }
                  >
                    {pets.map((pet) => (
                      <IonSelectOption key={pet.id} value={pet.id}>
                        {pet.nombre}
                      </IonSelectOption>
                    ))}
                  </IonSelect>

                    <IonSelect
                      className="appointments-field appointments-field--select"
                      interface="popover"
                      value={formData.veterinarianId || undefined}
                      placeholder="Selecciona un veterinario"
                      onIonChange={(event) => {
                        updateField(
                          "veterinarianId",
                          Number(event.detail.value ?? 0),
                        );
                        updateField("dateTime", "");
                      }}
                    >
                    {veterinarians.map((vet) => (
                      <IonSelectOption key={vet.id} value={vet.id}>
                        {getVetFullName(vet)}
                      </IonSelectOption>
                    ))}
                  </IonSelect>

                    <IonSelect
                      className="appointments-field appointments-field--select"
                      interface="popover"
                      value={formData.serviceId || undefined}
                      placeholder="Selecciona un servicio"
                      onIonChange={(event) => {
                        updateField("serviceId", Number(event.detail.value ?? 0));
                        updateField("dateTime", "");
                      }}
                    >
                    {services.map((service) => (
                      <IonSelectOption key={service.id} value={service.id}>
                        {service.nombre}
                      </IonSelectOption>
                    ))}
                  </IonSelect>

                  <button
                    className="appointments-datetime-trigger"
                    type="button"
                    onClick={() => setIsCreateDateModalOpen(true)}
                  >
                    <span className="appointments-datetime-trigger__label">
                      Fecha de atención
                    </span>
                    <strong className="appointments-datetime-trigger__value">
                      {formatDatePickerValue(
                        selectedAppointmentDate,
                        "Selecciona una fecha",
                      )}
                    </strong>
                  </button>
                </div>

                <IonModal
                  isOpen={isCreateDateModalOpen}
                  onDidDismiss={() => setIsCreateDateModalOpen(false)}
                >
                  <IonContent className="ion-padding">
                    <div className="appointments-datetime-modal">
                      <div className="appointments-datetime-modal__header">
                        <h2>Selecciona la fecha y hora</h2>
                        <IonButton
                          fill="clear"
                          onClick={() => setIsCreateDateModalOpen(false)}
                        >
                          Cerrar
                        </IonButton>
                      </div>

                      <IonDatetime
                        presentation="date"
                        locale="es-PE"
                        value={toDateOnlyValue(selectedAppointmentDate)}
                        onIonChange={(event) => {
                          setFormError("");
                          updateField("dateTime", "");
                          setSelectedAppointmentDate(
                            String(event.detail.value ?? "").slice(0, 10),
                          );
                        }}
                      />

                      <IonButton
                        expand="block"
                        onClick={() => setIsCreateDateModalOpen(false)}
                      >
                        Confirmar
                      </IonButton>
                    </div>
                  </IonContent>
                </IonModal>

                <IonTextarea
                  className="appointments-field"
                  fill="outline"
                  label="Notas"
                  labelPlacement="stacked"
                  value={formData.notes}
                  autoGrow
                  onIonInput={(event) =>
                    updateField("notes", String(event.detail.value ?? ""))
                  }
                />

                {availabilityError && (
                  <IonText color="warning">
                    <p className="appointments-feedback">{availabilityError}</p>
                  </IonText>
                )}

                {isAvailabilityLoading ? (
                  <div className="appointments-loading">
                    <IonSpinner name="crescent" />
                    <span>Consultando disponibilidad...</span>
                  </div>
                ) : selectedAppointmentDate ? (
                  <>
                    {Array.isArray(availableSlots) ? (
                      <IonSelect
                        className="appointments-field appointments-field--select"
                        interface="popover"
                        value={formData.dateTime || undefined}
                        placeholder={
                          availableSlots.length > 0
                            ? "Selecciona un horario disponible"
                            : "No hay horarios disponibles"
                        }
                        disabled={availableSlots.length === 0}
                        onIonChange={(event) =>
                          updateField(
                            "dateTime",
                            buildDateTimeFromSlot(
                              String(event.detail.value ?? ""),
                              selectedAppointmentDate,
                            ),
                          )
                        }
                      >
                        {availableSlots.map((slot) => (
                          <IonSelectOption key={slot.dateTime} value={slot.dateTime}>
                            {formatAvailableSlot(
                              slot.dateTime,
                              selectedAppointmentDate,
                            )}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    ) : null}

                    {formData.dateTime ? (
                      <p className="appointments-feedback">
                        Horario seleccionado: {formatDateTime(formData.dateTime)}
                      </p>
                    ) : null}

                    {availableSlots.length === 0 ? (
                      <p className="appointments-feedback">
                        No hay horarios disponibles para la fecha seleccionada.
                      </p>
                    ) : null}
                  </>
                ) : null}

                {formError && (
                  <IonText color="danger">
                    <p className="appointments-feedback">{formError}</p>
                  </IonText>
                )}

                <div className="appointments-form__actions">
                  <IonButton fill="outline" type="button" onClick={resetForm}>
                    Cancelar
                  </IonButton>

                  <IonButton type="submit" disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar cita"}
                  </IonButton>
                </div>
              </form>
            </section>
          )}

          <section className="appointments-table-card">
            <div className="appointments-filters">
              <IonInput
                className="appointments-field"
                fill="outline"
                placeholder="Buscar por mascota, veterinario o servicio..."
                value={query}
                onIonInput={(event) => setQuery(String(event.detail.value ?? ""))}
              />

              <IonSelect
                className="appointments-field appointments-field--select"
                interface="popover"
                value={veterinarianFilter}
                onIonChange={(event) =>
                  setVeterinarianFilter(String(event.detail.value ?? "0"))
                }
              >
                <IonSelectOption value="0">
                  Todos los veterinarios
                </IonSelectOption>
                {veterinarians.map((vet) => (
                  <IonSelectOption key={vet.id} value={String(vet.id)}>
                    {getVetFullName(vet)}
                  </IonSelectOption>
                ))}
              </IonSelect>

              <IonSelect
                className="appointments-field appointments-field--select"
                interface="popover"
                value={serviceFilter}
                onIonChange={(event) =>
                  setServiceFilter(String(event.detail.value ?? "0"))
                }
              >
                <IonSelectOption value="0">Todos los servicios</IonSelectOption>
                {services.map((service) => (
                  <IonSelectOption key={service.id} value={String(service.id)}>
                    {service.nombre}
                  </IonSelectOption>
                ))}
              </IonSelect>

              <IonSelect
                className="appointments-field appointments-field--select"
                interface="popover"
                value={statusFilter}
                onIonChange={(event) =>
                  setStatusFilter(String(event.detail.value ?? "todos"))
                }
              >
                <IonSelectOption value="todos">Todos los estados</IonSelectOption>
                <IonSelectOption value="AGENDADA">AGENDADA</IonSelectOption>
                <IonSelectOption value="CONFIRMADA">CONFIRMADA</IonSelectOption>
                <IonSelectOption value="REPROGRAMADA">REPROGRAMADA</IonSelectOption>
                <IonSelectOption value="CANCELADA">CANCELADA</IonSelectOption>
                <IonSelectOption value="ATENDIDA">ATENDIDA</IonSelectOption>
                <IonSelectOption value="NO_ASISTIO">NO_ASISTIO</IonSelectOption>
              </IonSelect>

              <IonInput
                className="appointments-field"
                fill="outline"
                label="Desde"
                labelPlacement="stacked"
                type="date"
                value={dateFromFilter}
                onIonInput={(event) =>
                  setDateFromFilter(String(event.detail.value ?? ""))
                }
              />

              <IonInput
                className="appointments-field"
                fill="outline"
                label="Hasta"
                labelPlacement="stacked"
                type="date"
                value={dateToFilter}
                onIonInput={(event) =>
                  setDateToFilter(String(event.detail.value ?? ""))
                }
              />
            </div>

            {error && (
              <IonText color="warning">
                <p className="appointments-feedback">{error}</p>
              </IonText>
            )}

            {isLoading ? (
              <div className="appointments-loading">
                <IonSpinner name="crescent" />
                <span>Cargando citas...</span>
              </div>
            ) : (
              <>
                <div className="appointments-table-wrapper">
                  <table className="appointments-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Mascota</th>
                        <th>Veterinario</th>
                        <th>Servicio</th>
                        <th>Fecha y hora</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment, index) => (
                        <tr key={appointment.id}>
                          <td>{index + 1}</td>
                          <td>{getAppointmentPetName(appointment, pets)}</td>
                          <td>
                            {getAppointmentVeterinarianName(
                              appointment,
                              veterinarians,
                            )}
                          </td>
                          <td>{getAppointmentServiceName(appointment, services)}</td>
                          <td>{formatDateTime(appointment.fechaHora)}</td>
                          <td>
                            <span className={getAppointmentStatusClass(appointment.estado)}>
                              {appointment.estado}
                            </span>
                          </td>
                          <td>
                            <div className="appointments-actions">
                              <button
                                className="appointments-action appointments-action--edit"
                                type="button"
                                onClick={() => handleStartEdit(appointment.id)}
                                disabled={isSubmittingAction === appointment.id}
                              >
                                <IonIcon icon={pencilOutline} />
                              </button>
                              <button
                                className="appointments-action appointments-action--view"
                                type="button"
                                onClick={() => handleViewDetails(appointment.id)}
                                disabled={isSubmittingAction === appointment.id}
                              >
                                <IonIcon icon={eyeOutline} />
                              </button>
                              <button
                                className="appointments-action appointments-action--delete"
                                type="button"
                                onClick={() => handleDeleteAppointment(appointment)}
                                disabled={isSubmittingAction === appointment.id}
                              >
                                <IonIcon icon={trashOutline} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="appointments-mobile-list">
                  {filteredAppointments.map((appointment, index) => (
                    <article className="appointments-mobile-card" key={appointment.id}>
                      <div className="appointments-mobile-card__top">
                        <span className="appointments-mobile-card__index">
                          #{index + 1}
                        </span>
                        <span className={getAppointmentStatusClass(appointment.estado)}>
                          {appointment.estado}
                        </span>
                      </div>

                      <h2>{getAppointmentPetName(appointment, pets)}</h2>
                      <p>{getAppointmentServiceName(appointment, services)}</p>

                      <div className="appointments-mobile-card__meta">
                        <span>
                          {getAppointmentVeterinarianName(
                            appointment,
                            veterinarians,
                          )}
                        </span>
                        <strong>{formatDateTime(appointment.fechaHora)}</strong>
                      </div>

                      <div className="appointments-actions">
                        <button
                          className="appointments-action appointments-action--edit"
                          type="button"
                          onClick={() => handleStartEdit(appointment.id)}
                          disabled={isSubmittingAction === appointment.id}
                        >
                          <IonIcon icon={pencilOutline} />
                        </button>
                        <button
                          className="appointments-action appointments-action--view"
                          type="button"
                          onClick={() => handleViewDetails(appointment.id)}
                          disabled={isSubmittingAction === appointment.id}
                        >
                          <IonIcon icon={eyeOutline} />
                        </button>
                        <button
                          className="appointments-action appointments-action--delete"
                          type="button"
                          onClick={() => handleDeleteAppointment(appointment)}
                          disabled={isSubmittingAction === appointment.id}
                        >
                          <IonIcon icon={trashOutline} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <footer className="appointments-footer">
                  Total de citas: {filteredAppointments.length}
                </footer>
              </>
            )}
          </section>

          {(selectedAppointment || isDetailLoading) && (
            <section className="appointments-detail-card" ref={detailSectionRef}>
              <div className="appointments-detail-card__header">
                <div>
                  <h2>Detalle de la cita</h2>
                  <p>Información ampliada de la cita seleccionada.</p>
                </div>

                <IonButton
                  aria-label="Cerrar detalle"
                  className="appointments-form-card__close"
                  fill="clear"
                  onClick={() => {
                    setSelectedAppointment(null);
                    setIsEditMode(false);
                  }}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              {isDetailLoading ? (
                <div className="appointments-loading">
                  <IonSpinner name="crescent" />
                  <span>Cargando detalle...</span>
                </div>
              ) : selectedAppointment ? (
                <div className="appointments-detail-grid">
                  <div className="appointments-detail-item">
                    <span>Mascota</span>
                    <strong>
                      {getAppointmentPetName(selectedAppointment, pets)}
                    </strong>
                  </div>
                  <div className="appointments-detail-item">
                    <span>Veterinario</span>
                    <strong>
                      {getAppointmentVeterinarianName(
                        selectedAppointment,
                        veterinarians,
                      )}
                    </strong>
                  </div>
                  <div className="appointments-detail-item">
                    <span>Servicio</span>
                    <strong>
                      {getAppointmentServiceName(selectedAppointment, services)}
                    </strong>
                  </div>
                  <div className="appointments-detail-item">
                    <span>Fecha y hora</span>
                    <strong>{formatDateTime(selectedAppointment.fechaHora)}</strong>
                  </div>
                  <div className="appointments-detail-item">
                    <span>Estado</span>
                    <strong>{selectedAppointment.estado}</strong>
                  </div>
                  <div className="appointments-detail-item">
                    <span>Creado por</span>
                    <strong>{getAppointmentCreatorName(selectedAppointment)}</strong>
                  </div>
                  <div className="appointments-detail-item appointments-detail-item--full">
                    <span>Notas</span>
                    <strong>{selectedAppointment.notas || "Sin notas"}</strong>
                  </div>
                </div>
              ) : null}

              {selectedAppointment && isEditMode && (
                <form
                  className="appointments-edit-form"
                  onSubmit={handleUpdateAppointment}
                >
                  <div className="appointments-edit-form__grid">
                    <button
                      className="appointments-datetime-trigger"
                      type="button"
                      onClick={() => setIsEditDateModalOpen(true)}
                    >
                      <span className="appointments-datetime-trigger__label">
                        Reprogramar fecha y hora
                      </span>
                      <strong className="appointments-datetime-trigger__value">
                        {formatDateTimePickerValue(
                          editDateTime,
                          "Selecciona fecha y hora",
                        )}
                      </strong>
                    </button>

                    <IonSelect
                      className="appointments-field appointments-field--select"
                      interface="popover"
                      value={editStatus}
                      placeholder="Estado"
                      onIonChange={(event) =>
                        setEditStatus(String(event.detail.value ?? ""))
                      }
                    >
                      <IonSelectOption value="AGENDADA">AGENDADA</IonSelectOption>
                      <IonSelectOption value="CONFIRMADA">CONFIRMADA</IonSelectOption>
                      <IonSelectOption value="REPROGRAMADA">REPROGRAMADA</IonSelectOption>
                      <IonSelectOption value="CANCELADA">CANCELADA</IonSelectOption>
                      <IonSelectOption value="ATENDIDA">ATENDIDA</IonSelectOption>
                      <IonSelectOption value="NO_ASISTIO">NO_ASISTIO</IonSelectOption>
                    </IonSelect>
                  </div>

                  <IonModal
                    isOpen={isEditDateModalOpen}
                    onDidDismiss={() => setIsEditDateModalOpen(false)}
                  >
                    <IonContent className="ion-padding">
                      <div className="appointments-datetime-modal">
                        <div className="appointments-datetime-modal__header">
                          <h2>Reprogramar cita</h2>
                          <IonButton
                            fill="clear"
                            onClick={() => setIsEditDateModalOpen(false)}
                          >
                            Cerrar
                          </IonButton>
                        </div>

                        <IonDatetime
                          presentation="date-time"
                          hourCycle="h12"
                          locale="es-PE"
                          value={toDatetimeValue(editDateTime)}
                          onIonChange={(event) =>
                            setEditDateTime(
                              toInputDateTime(String(event.detail.value ?? "")),
                            )
                          }
                        />

                        <IonButton
                          expand="block"
                          onClick={() => setIsEditDateModalOpen(false)}
                        >
                          Confirmar
                        </IonButton>
                      </div>
                    </IonContent>
                  </IonModal>

                  <div className="appointments-edit-form__actions">
                    <IonButton
                      fill="outline"
                      type="button"
                      onClick={() => setIsEditMode(false)}
                    >
                      Cancelar edición
                    </IonButton>
                    <IonButton type="submit" disabled={isUpdatingAppointment}>
                      {isUpdatingAppointment ? "Actualizando..." : "Guardar cambios"}
                    </IonButton>
                  </div>
                </form>
              )}
            </section>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Appointments;
