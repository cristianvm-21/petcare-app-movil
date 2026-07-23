import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTextarea,
} from "@ionic/react";
import { AxiosError } from "axios";
import { addOutline, closeOutline, hourglassOutline } from "ionicons/icons";
import React, { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/AppHeader/AppHeader";
import { AppointmentItem } from "../../contracts/appointmentContract";
import { PetItem } from "../../contracts/petContract";
import {
  CreateWaitingRoomRequest,
  WaitingRoomItem,
} from "../../contracts/waitingRoomContract";
import {
  createWaitingRoomEntry,
  findWaitingRoomEntries,
  findWaitingRoomEntriesByStatus,
  updateWaitingRoomStatus,
} from "../../services/waitingRoomService";
import { findAllAppointments } from "../../services/appointmentService";
import { findAllPets } from "../../services/petService";
import { findAllVetServices } from "../../services/vetCatalogService";
import { VetServiceItem } from "../../contracts/vetServiceContract";
import "./WaitingRoom.css";

const initialFormData: CreateWaitingRoomRequest = {
  appointmentId: 0,
  observations: "",
};

const waitingRoomFilterOptions = [
  "PENDIENTE",
  "EN_ATENCION",
  "ATENDIDO",
  "REPROGRAMADO",
] as const;

const waitingRoomManualStatusOptions = ["PENDIENTE", "REPROGRAMADO"] as const;

function formatDateTime(value: string) {
  if (!value) {
    return "Sin fecha";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Lima",
  });
}

function getDateKeyInTimeZone(value: Date | string, timeZone: string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function isAppointmentForTodayInLima(value: string) {
  const appointmentDateKey = getDateKeyInTimeZone(value, "America/Lima");
  const todayDateKey = getDateKeyInTimeZone(new Date(), "America/Lima");

  return Boolean(appointmentDateKey && appointmentDateKey === todayDateKey);
}

function isEligibleAppointmentStatus(status: string) {
  return ["AGENDADA", "CONFIRMADA", "REPROGRAMADA"].includes(status);
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

function getAppointmentLabel(
  appointment: AppointmentItem,
  pets: PetItem[],
  services: VetServiceItem[],
) {
  return `${getAppointmentPetName(appointment, pets)} · ${getAppointmentServiceName(
    appointment,
    services,
  )} · ${formatDateTime(appointment.fechaHora)}`;
}

function getWaitingRoomStatusClass(status: string) {
  switch (status) {
    case "ATENDIDO":
      return "waiting-room-status waiting-room-status--attended";
    case "EN_ATENCION":
      return "waiting-room-status waiting-room-status--triage";
    case "REPROGRAMADO":
      return "waiting-room-status waiting-room-status--reprogrammed";
    default:
      return "waiting-room-status waiting-room-status--waiting";
  }
}

function getWaitingRoomErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  const responseData = error.response?.data;
  const backendMessage =
    (typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof responseData.message === "string" &&
      responseData.message) ||
    (typeof responseData === "object" &&
      responseData !== null &&
      "detail" in responseData &&
      typeof responseData.detail === "string" &&
      responseData.detail) ||
    (typeof responseData === "object" &&
      responseData !== null &&
      "error" in responseData &&
      typeof responseData.error === "string" &&
      responseData.error) ||
    (typeof responseData === "string" ? responseData : "");

  return backendMessage || fallback;
}

const WaitingRoom: React.FC = () => {
  const [entries, setEntries] = useState<WaitingRoomItem[]>([]);
  const [allEntries, setAllEntries] = useState<WaitingRoomItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [pets, setPets] = useState<PetItem[]>([]);
  const [services, setServices] = useState<VetServiceItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [isDependenciesLoading, setIsDependenciesLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<CreateWaitingRoomRequest>(initialFormData);
  const [updatingEntryId, setUpdatingEntryId] = useState<number | null>(null);

  async function loadDependencies() {
    try {
      setIsDependenciesLoading(true);

      const [appointmentsData, petsData, servicesData] = await Promise.all([
        findAllAppointments(),
        findAllPets(),
        findAllVetServices(),
      ]);

      setAppointments(appointmentsData);
      setPets(petsData);
      setServices(servicesData);
    } catch (err) {
      console.error("No se pudieron cargar las dependencias de sala de espera:", err);
      setError("No se pudieron cargar citas, mascotas o servicios.");
    } finally {
      setIsDependenciesLoading(false);
    }
  }

  async function loadEntries() {
    try {
      setIsLoading(true);
      setError("");

      const entriesData =
        statusFilter !== "todos"
          ? await findWaitingRoomEntriesByStatus(statusFilter)
          : await findWaitingRoomEntries();

      setEntries(entriesData);
    } catch (err) {
      console.error("No se pudieron cargar los registros de sala de espera:", err);
      setError("No se pudieron cargar los registros de sala de espera.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAllEntriesForValidation() {
    try {
      const entriesData = await findWaitingRoomEntries();
      setAllEntries(entriesData);
    } catch (err) {
      console.error(
        "No se pudieron cargar todos los registros de sala de espera para validacion:",
        err,
      );
    }
  }

  useEffect(() => {
    void loadDependencies();
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [statusFilter]);

  useEffect(() => {
    void loadAllEntriesForValidation();
  }, []);

  const registeredAppointmentIds = useMemo(
    () => new Set(allEntries.map((entry) => entry.appointmentId)),
    [allEntries],
  );

  const availableAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          !registeredAppointmentIds.has(appointment.id) &&
          isAppointmentForTodayInLima(appointment.fechaHora) &&
          isEligibleAppointmentStatus(appointment.estado),
      ),
    [appointments, registeredAppointmentIds],
  );

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter((entry) => {
      const appointment = appointments.find(
        (appointmentItem) => appointmentItem.id === entry.appointmentId,
      );

      const appointmentLabel = appointment
        ? getAppointmentLabel(appointment, pets, services)
        : `Cita #${entry.appointmentId}`;

      const petName =
        appointment?.mascota.nombre ||
        pets.find((pet) => pet.id === entry.petId)?.nombre ||
        `Mascota #${entry.petId}`;

      return (
        normalizedQuery.length === 0 ||
        appointmentLabel.toLowerCase().includes(normalizedQuery) ||
        petName.toLowerCase().includes(normalizedQuery) ||
        entry.status.toLowerCase().includes(normalizedQuery) ||
        entry.observations.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [appointments, entries, pets, query, services]);

  function updateField<K extends keyof CreateWaitingRoomRequest>(
    field: K,
    value: CreateWaitingRoomRequest[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setFormData(initialFormData);
    setFormError("");
    setIsFormVisible(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formData.appointmentId <= 0) {
      setFormError("Selecciona una cita para registrar su llegada.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");
      await createWaitingRoomEntry(formData);
      resetForm();
      await loadEntries();
      await loadAllEntriesForValidation();
    } catch (err) {
      console.error("No se pudo registrar la sala de espera:", err);
      setFormError("No se pudo registrar el ingreso a sala de espera.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateStatus(entryId: number, status: string) {
    const currentEntry = entries.find((entry) => entry.id === entryId);

    if (!currentEntry || currentEntry.status === status) {
      return;
    }

    try {
      setUpdatingEntryId(entryId);
      setError("");
      await updateWaitingRoomStatus(entryId, { status });
      await loadEntries();
    } catch (err) {
      console.error("No se pudo actualizar el estado en sala de espera:", err);
      setError(
        getWaitingRoomErrorMessage(
          err,
          "No se pudo actualizar el estado del paciente.",
        ),
      );
    } finally {
      setUpdatingEntryId(null);
    }
  }

  return (
    <IonPage>
      <AppHeader title="Sala de Espera" />
      <IonContent>
        <div className="waiting-room-screen">
          <section className="waiting-room-hero">
            <div>
              <div className="waiting-room-hero__title-row">
                <IonIcon icon={hourglassOutline} />
                <h1>Sala de Espera</h1>
              </div>
              <p>Registra la llegada del paciente y controla su avance hacia triaje.</p>
            </div>

            <IonButton
              className="waiting-room-hero__cta"
              onClick={() => {
                setFormError("");
                setFormData(initialFormData);
                setIsFormVisible((current) => !current);
              }}
            >
              <IonIcon icon={addOutline} slot="start" />
              Nuevo ingreso
            </IonButton>
          </section>

          {isFormVisible && (
            <section className="waiting-room-form-card">
              <div className="waiting-room-form-card__header">
                <div>
                  <h2>Registrar ingreso</h2>
                  <p>Selecciona una cita elegible y agrega observaciones iniciales.</p>
                </div>

                <IonButton
                  aria-label="Cerrar formulario"
                  className="waiting-room-form-card__close"
                  fill="clear"
                  onClick={resetForm}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              <form className="waiting-room-form" onSubmit={handleSubmit}>
                <IonSelect
                  className="waiting-room-field waiting-room-field--select"
                  interface="popover"
                  value={formData.appointmentId || undefined}
                  placeholder={
                    isDependenciesLoading
                      ? "Cargando citas..."
                      : availableAppointments.length > 0
                        ? "Selecciona una cita"
                        : "No hay citas disponibles"
                  }
                  onIonChange={(event) =>
                    updateField(
                      "appointmentId",
                      Number(event.detail.value ?? 0),
                    )
                  }
                >
                  {availableAppointments.map((appointment) => (
                    <IonSelectOption key={appointment.id} value={appointment.id}>
                      {getAppointmentLabel(appointment, pets, services)}
                    </IonSelectOption>
                  ))}
                </IonSelect>

                <IonTextarea
                  className="waiting-room-field"
                  fill="outline"
                  label="Observaciones"
                  labelPlacement="stacked"
                  autoGrow
                  value={formData.observations}
                  onIonInput={(event) =>
                    updateField("observations", String(event.detail.value ?? ""))
                  }
                />

                {formError && (
                  <IonText color="danger">
                    <p className="waiting-room-feedback">{formError}</p>
                  </IonText>
                )}

                {!isDependenciesLoading && availableAppointments.length === 0 ? (
                  <IonText color="medium">
                    <p className="waiting-room-feedback">
                      No hay citas elegibles. Deben ser citas del día actual en
                      America/Lima, con estado AGENDADA, CONFIRMADA o
                      REPROGRAMADA, y sin ingreso previo.
                    </p>
                  </IonText>
                ) : null}

                <div className="waiting-room-form__actions">
                  <IonButton fill="outline" type="button" onClick={resetForm}>
                    Cancelar
                  </IonButton>
                  <IonButton type="submit" disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Registrar ingreso"}
                  </IonButton>
                </div>
              </form>
            </section>
          )}

          <section className="waiting-room-table-card">
            <div className="waiting-room-filters">
              <IonInput
                className="waiting-room-field"
                fill="outline"
                placeholder="Buscar por cita, mascota, estado u observaciones..."
                value={query}
                onIonInput={(event) => setQuery(String(event.detail.value ?? ""))}
              />

              <IonSelect
                className="waiting-room-field waiting-room-field--select"
                interface="popover"
                value={statusFilter}
                onIonChange={(event) =>
                  setStatusFilter(String(event.detail.value ?? "todos"))
                }
              >
                <IonSelectOption value="todos">Todos los estados</IonSelectOption>
                {waitingRoomFilterOptions.map((status) => (
                  <IonSelectOption key={status} value={status}>
                    {status}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>

            {error && (
              <IonText color="warning">
                <p className="waiting-room-feedback">{error}</p>
              </IonText>
            )}

            {isLoading ? (
              <div className="waiting-room-loading">
                <IonSpinner name="crescent" />
                <span>Cargando sala de espera...</span>
              </div>
            ) : (
              <>
                <div className="waiting-room-table-wrapper">
                  <table className="waiting-room-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Mascota</th>
                        <th>Llegada</th>
                        <th>Estado</th>
                        <th>Observaciones</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry, index) => {
                        const appointment = appointments.find(
                          (appointmentItem) => appointmentItem.id === entry.appointmentId,
                        );
                        const petName =
                          appointment?.mascota.nombre ||
                          pets.find((pet) => pet.id === entry.petId)?.nombre ||
                          `Mascota #${entry.petId}`;

                        return (
                          <tr key={entry.id}>
                            <td>{index + 1}</td>
                            <td>{petName}</td>
                            <td>{formatDateTime(entry.arrivalDate)}</td>
                            <td>
                              <span className={getWaitingRoomStatusClass(entry.status)}>
                                {entry.status}
                              </span>
                            </td>
                            <td>{entry.observations || "Sin observaciones"}</td>
                            <td>
                              <IonSelect
                                className="waiting-room-status-select"
                                interface="popover"
                                value={entry.status}
                                disabled={updatingEntryId === entry.id}
                                onIonChange={(event) =>
                                  handleUpdateStatus(
                                    entry.id,
                                    String(event.detail.value ?? entry.status),
                                  )
                                }
                              >
                                {waitingRoomManualStatusOptions.map((status) => (
                                  <IonSelectOption key={status} value={status}>
                                    {status}
                                  </IonSelectOption>
                                ))}
                              </IonSelect>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="waiting-room-mobile-list">
                  {filteredEntries.map((entry, index) => {
                    const appointment = appointments.find(
                      (appointmentItem) => appointmentItem.id === entry.appointmentId,
                    );
                    const petName =
                      appointment?.mascota.nombre ||
                      pets.find((pet) => pet.id === entry.petId)?.nombre ||
                      `Mascota #${entry.petId}`;

                    return (
                      <article className="waiting-room-mobile-card" key={entry.id}>
                        <div className="waiting-room-mobile-card__top">
                          <span className="waiting-room-mobile-card__index">
                            #{index + 1}
                          </span>
                          <span className={getWaitingRoomStatusClass(entry.status)}>
                            {entry.status}
                          </span>
                        </div>

                        <h2>{petName}</h2>
                        <p>
                          {appointment
                            ? getAppointmentLabel(appointment, pets, services)
                            : `Cita #${entry.appointmentId}`}
                        </p>

                        <div className="waiting-room-mobile-card__meta">
                          <span>{formatDateTime(entry.arrivalDate)}</span>
                          <strong>{entry.observations || "Sin observaciones"}</strong>
                        </div>

                        <IonSelect
                          className="waiting-room-status-select"
                          interface="popover"
                          value={entry.status}
                          disabled={updatingEntryId === entry.id}
                          onIonChange={(event) =>
                            handleUpdateStatus(
                              entry.id,
                              String(event.detail.value ?? entry.status),
                            )
                          }
                        >
                          {waitingRoomManualStatusOptions.map((status) => (
                            <IonSelectOption key={status} value={status}>
                              {status}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </article>
                    );
                  })}
                </div>

                <footer className="waiting-room-footer">
                  Total en sala de espera: {filteredEntries.length}
                </footer>
              </>
            )}
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default WaitingRoom;
