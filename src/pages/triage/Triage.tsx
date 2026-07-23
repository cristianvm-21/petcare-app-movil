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
import {
  addOutline,
  closeOutline,
  eyeOutline,
  pulseOutline,
} from "ionicons/icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import AppHeader from "../../components/AppHeader/AppHeader";
import {
  AppointmentItem,
} from "../../contracts/appointmentContract";
import {
  CreateTriageRequest,
  TriageItem,
  TriageUrgencyLevel,
} from "../../contracts/triageContract";
import { PetItem } from "../../contracts/petContract";
import { VetServiceItem } from "../../contracts/vetServiceContract";
import { WaitingRoomItem } from "../../contracts/waitingRoomContract";
import {
  createTriage,
  findAllTriages,
  findTriageById,
  findTriagesByAppointmentId,
  findTriagesByUrgency,
} from "../../services/triageService";
import { findAllAppointments } from "../../services/appointmentService";
import { findAllPets } from "../../services/petService";
import { findAllVetServices } from "../../services/vetCatalogService";
import { findWaitingRoomEntries } from "../../services/waitingRoomService";
import "./Triage.css";

const initialFormData: CreateTriageRequest = {
  appointmentId: 0,
  reasonForVisit: "",
  urgencyLevel: "",
  visibleSigns: "",
  observations: "",
};

const urgencyOptions: TriageUrgencyLevel[] = [
  "RUTINARIA",
  "PREFERENTE",
  "URGENTE",
  "EMERGENCIA",
];

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
  services: VetServiceItem[],
) {
  const serviceName = getAppointmentServiceName(appointment, services);
  return `${serviceName} · ${formatDateTime(appointment.fechaHora)}`;
}

function getAssistantName(assistantId: number) {
  return assistantId > 0 ? `Asistente #${assistantId}` : "Sin registro";
}

function getUrgencyClass(level: string) {
  switch (level) {
    case "EMERGENCIA":
      return "triage-status triage-status--emergency";
    case "URGENTE":
      return "triage-status triage-status--urgent";
    case "PREFERENTE":
      return "triage-status triage-status--priority";
    default:
      return "triage-status triage-status--routine";
  }
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

function parseOptionalNumber(value: string | number | null | undefined) {
  const normalizedValue = String(value ?? "").trim();

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
}

function isEligibleAppointmentStatus(status: string) {
  return ["AGENDADA", "CONFIRMADA", "REPROGRAMADA"].includes(status);
}

function isEligibleWaitingRoomStatus(status: string) {
  return ["PENDIENTE"].includes(status);
}

function getTriageErrorMessage(error: unknown, fallback: string) {
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
    (typeof responseData === "object" &&
      responseData !== null &&
      "errors" in responseData &&
      Array.isArray(responseData.errors) &&
      responseData.errors
        .map((item: unknown) =>
          typeof item === "string"
            ? item
            : typeof item === "object" &&
                item !== null &&
                "message" in item &&
                typeof item.message === "string"
              ? item.message
              : "",
        )
        .filter(Boolean)
        .join(". ")) ||
    (typeof responseData === "string" ? responseData : "");

  if (error.response?.status === 400) {
    return backendMessage || "Los datos del triaje no son válidos.";
  }

  if (error.response?.status === 409) {
    return backendMessage || "La cita ya tiene un triaje registrado.";
  }

  return backendMessage || fallback;
}

const Triage: React.FC = () => {
  const [triages, setTriages] = useState<TriageItem[]>([]);
  const [allTriages, setAllTriages] = useState<TriageItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [pets, setPets] = useState<PetItem[]>([]);
  const [services, setServices] = useState<VetServiceItem[]>([]);
  const [waitingRoomEntries, setWaitingRoomEntries] = useState<WaitingRoomItem[]>([]);
  const [query, setQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("todos");
  const [appointmentFilter, setAppointmentFilter] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isDependenciesLoading, setIsDependenciesLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedTriage, setSelectedTriage] = useState<TriageItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTriageRequest>(initialFormData);
  const detailSectionRef = useRef<HTMLElement | null>(null);

  async function loadDependencies() {
    try {
      setIsDependenciesLoading(true);

      const [
        appointmentsData,
        petsData,
        servicesData,
        waitingRoomData,
      ] = await Promise.all([
        findAllAppointments(),
        findAllPets(),
        findAllVetServices(),
        findWaitingRoomEntries(),
      ]);

      setAppointments(appointmentsData);
      setPets(petsData);
      setServices(servicesData);
      setWaitingRoomEntries(waitingRoomData);
    } catch (err) {
      console.error("No se pudieron cargar las dependencias de triaje:", err);
      setError("No se pudieron cargar las dependencias principales de triaje.");
    } finally {
      setIsDependenciesLoading(false);
    }
  }

  async function loadTriages() {
    try {
      setIsLoading(true);
      setError("");

      let triageData: TriageItem[];

      if (Number(appointmentFilter) > 0) {
        triageData = await findTriagesByAppointmentId(Number(appointmentFilter));
      } else if (urgencyFilter !== "todos") {
        triageData = await findTriagesByUrgency(urgencyFilter);
      } else {
        triageData = await findAllTriages();
      }

      setTriages(triageData);
    } catch (err) {
      console.error("No se pudieron cargar los triajes:", err);
      setError("No se pudieron cargar los triajes del backend.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAllTriagesForValidation() {
    try {
      const triageData = await findAllTriages();
      setAllTriages(triageData);
    } catch (err) {
      console.error("No se pudieron cargar todos los triajes para validacion:", err);
    }
  }

  useEffect(() => {
    void loadDependencies();
  }, []);

  useEffect(() => {
    void loadTriages();
  }, [urgencyFilter, appointmentFilter]);

  useEffect(() => {
    void loadAllTriagesForValidation();
  }, []);

  useEffect(() => {
    if (!selectedTriage && !isDetailLoading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      detailSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [selectedTriage, isDetailLoading]);

  function updateField<K extends keyof CreateTriageRequest>(
    field: K,
    value: CreateTriageRequest[K],
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

  const triagedAppointmentIds = useMemo(
    () => new Set(allTriages.map((triage) => triage.appointmentId)),
    [allTriages],
  );

  const availableWaitingRoomEntries = useMemo(
    () =>
      waitingRoomEntries.filter((entry) => {
        const appointment = appointments.find(
          (appointmentItem) => appointmentItem.id === entry.appointmentId,
        );

        if (!appointment) {
          return false;
        }

        return (
          !triagedAppointmentIds.has(entry.appointmentId) &&
          isEligibleWaitingRoomStatus(entry.status) &&
          isAppointmentForTodayInLima(appointment.fechaHora) &&
          isEligibleAppointmentStatus(appointment.estado)
        );
      }),
    [appointments, triagedAppointmentIds, waitingRoomEntries],
  );

  const availableAppointments = useMemo(
    () =>
      availableWaitingRoomEntries
        .map((entry) =>
          appointments.find(
            (appointment) => appointment.id === entry.appointmentId,
          ),
        )
        .filter((appointment): appointment is AppointmentItem => Boolean(appointment)),
    [appointments, availableWaitingRoomEntries],
  );

  const waitingRoomByAppointmentId = useMemo(
    () =>
      new Map(
        waitingRoomEntries.map((entry) => [entry.appointmentId, entry] as const),
      ),
    [waitingRoomEntries],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      formData.appointmentId <= 0 ||
      !formData.reasonForVisit.trim() ||
      !formData.urgencyLevel.trim()
    ) {
      setFormError("Completa la cita, el motivo de visita y la urgencia.");
      return;
    }

    const existingTriage = allTriages.find(
      (triage) => triage.appointmentId === formData.appointmentId,
    );

    if (existingTriage) {
      setFormError("La cita seleccionada ya tiene un triaje registrado.");
      return;
    }

    const selectedAppointment = appointments.find(
      (appointment) => appointment.id === formData.appointmentId,
    );
    const waitingRoomEntry = waitingRoomByAppointmentId.get(formData.appointmentId);

    if (
      !selectedAppointment ||
      !isAppointmentForTodayInLima(selectedAppointment.fechaHora)
    ) {
      setFormError(
        "Solo puedes registrar triajes para citas del día actual en America/Lima.",
      );
      return;
    }

    if (!waitingRoomEntry || !isEligibleWaitingRoomStatus(waitingRoomEntry.status)) {
      setFormError(
        "La cita debe estar registrada en sala de espera y en estado PENDIENTE.",
      );
      return;
    }

    if (!isEligibleAppointmentStatus(selectedAppointment.estado)) {
      setFormError(
        "La cita seleccionada no está en un estado válido para registrar triaje.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      await createTriage(formData);
      resetForm();
      await loadTriages();
      await loadAllTriagesForValidation();
      const waitingRoomData = await findWaitingRoomEntries();
      setWaitingRoomEntries(waitingRoomData);
    } catch (err) {
      console.error("No se pudo registrar el triaje:", err);
      setFormError(
        getTriageErrorMessage(
          err,
          "No se pudo registrar el triaje. Inténtalo nuevamente.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleViewDetail(triageId: number) {
    try {
      setIsDetailLoading(true);
      const triageDetail = await findTriageById(triageId);
      setSelectedTriage(triageDetail);
    } catch (err) {
      console.error("No se pudo cargar el detalle del triaje:", err);
      setError("No se pudo cargar el detalle del triaje.");
    } finally {
      setIsDetailLoading(false);
    }
  }

  const filteredTriages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return triages.filter((triage) => {
      const appointment = appointments.find(
        (item) => item.id === triage.appointmentId,
      );
      const appointmentLabel = appointment
        ? getAppointmentLabel(appointment, services)
        : "";
      const petName = appointment
        ? getAppointmentPetName(appointment, pets)
        : "";

      const matchesQuery =
        normalizedQuery.length === 0 ||
        triage.reasonForVisit.toLowerCase().includes(normalizedQuery) ||
        triage.visibleSigns.toLowerCase().includes(normalizedQuery) ||
        triage.observations.toLowerCase().includes(normalizedQuery) ||
        appointmentLabel.toLowerCase().includes(normalizedQuery) ||
        petName.toLowerCase().includes(normalizedQuery);

      const matchesUrgency =
        urgencyFilter === "todos" || triage.urgencyLevel === urgencyFilter;

      const matchesAppointment =
        appointmentFilter === "0" ||
        triage.appointmentId === Number(appointmentFilter);

      return matchesQuery && matchesUrgency && matchesAppointment;
    });
  }, [appointments, appointmentFilter, pets, query, services, triages, urgencyFilter]);

  return (
    <IonPage>
      <AppHeader title="Triaje" />
      <IonContent>
        <div className="triage-screen">
          <section className="triage-hero">
            <div>
              <div className="triage-hero__title-row">
                <IonIcon icon={pulseOutline} />
                <h1>Triaje</h1>
              </div>
              <p>
                Registra la evaluación inicial, prioridad y signos observables de
                cada paciente.
              </p>
            </div>

            <IonButton
              className="triage-hero__cta"
              onClick={() => {
                setFormError("");
                setFormData(initialFormData);
                setIsFormVisible((current) => !current);
              }}
            >
              <IonIcon icon={addOutline} slot="start" />
              Nuevo Triaje
            </IonButton>
          </section>

          {isFormVisible && (
            <section className="triage-form-card">
              <div className="triage-form-card__header">
                <div>
                  <h2>Registrar nuevo triaje</h2>
                  <p>Completa la valoración inicial antes de la atención clínica.</p>
                </div>

                <IonButton
                  aria-label="Cerrar formulario"
                  className="triage-form-card__close"
                  fill="clear"
                  onClick={resetForm}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              <form className="triage-form" onSubmit={handleSubmit}>
                <div className="triage-form__grid">
                  <IonSelect
                    className="triage-field triage-field--select triage-field--full"
                    interface="popover"
                    value={formData.appointmentId || undefined}
                    placeholder={
                      isDependenciesLoading
                        ? "Cargando citas..."
                        : availableAppointments.length > 0
                          ? "Selecciona una cita"
                          : "No hay ingresos disponibles para triaje"
                    }
                    onIonChange={(event) =>
                      updateField(
                        "appointmentId",
                        Number(event.detail.value ?? 0),
                      )
                    }
                  >
                    {availableAppointments.map((appointment) => (
                      <IonSelectOption
                        key={appointment.id}
                        value={appointment.id}
                      >
                        {`${getAppointmentPetName(appointment, pets)} · ${getAppointmentLabel(appointment, services)}`}
                      </IonSelectOption>
                    ))}
                  </IonSelect>

                  <IonInput
                    className="triage-field"
                    fill="outline"
                    label="Motivo de visita"
                    labelPlacement="stacked"
                    value={formData.reasonForVisit}
                    onIonInput={(event) =>
                      updateField(
                        "reasonForVisit",
                        String(event.detail.value ?? ""),
                      )
                    }
                  />

                  <IonSelect
                    className="triage-field triage-field--select"
                    interface="popover"
                    value={formData.urgencyLevel}
                    placeholder="Nivel de urgencia"
                    onIonChange={(event) =>
                      updateField(
                        "urgencyLevel",
                        String(event.detail.value ?? ""),
                      )
                    }
                  >
                    {urgencyOptions.map((option) => (
                      <IonSelectOption key={option} value={option}>
                        {option}
                      </IonSelectOption>
                    ))}
                  </IonSelect>

                  <IonInput
                    className="triage-field"
                    fill="outline"
                    label="Peso (kg)"
                    labelPlacement="stacked"
                    type="number"
                    value={String(formData.weight ?? "")}
                    onIonInput={(event) =>
                      updateField(
                        "weight",
                        parseOptionalNumber(event.detail.value),
                      )
                    }
                  />

                  <IonInput
                    className="triage-field"
                    fill="outline"
                    label="Temperatura (°C)"
                    labelPlacement="stacked"
                    type="number"
                    value={String(formData.temperature ?? "")}
                    onIonInput={(event) =>
                      updateField(
                        "temperature",
                        parseOptionalNumber(event.detail.value),
                      )
                    }
                  />

                  <IonInput
                    className="triage-field"
                    fill="outline"
                    label="Frecuencia cardiaca"
                    labelPlacement="stacked"
                    type="number"
                    value={String(formData.heartRate ?? "")}
                    onIonInput={(event) =>
                      updateField(
                        "heartRate",
                        parseOptionalNumber(event.detail.value),
                      )
                    }
                  />

                  <IonInput
                    className="triage-field"
                    fill="outline"
                    label="Frecuencia respiratoria"
                    labelPlacement="stacked"
                    type="number"
                    value={String(formData.respiratoryRate ?? "")}
                    onIonInput={(event) =>
                      updateField(
                        "respiratoryRate",
                        parseOptionalNumber(event.detail.value),
                      )
                    }
                  />
                </div>

                <IonTextarea
                  className="triage-field"
                  fill="outline"
                  label="Signos visibles"
                  labelPlacement="stacked"
                  autoGrow
                  value={formData.visibleSigns}
                  onIonInput={(event) =>
                    updateField("visibleSigns", String(event.detail.value ?? ""))
                  }
                />

                <IonTextarea
                  className="triage-field"
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
                    <p className="triage-feedback">{formError}</p>
                  </IonText>
                )}

                {!isDependenciesLoading && availableAppointments.length === 0 ? (
                  <IonText color="medium">
                    <p className="triage-feedback">
                      No hay ingresos elegibles para triaje. La cita debe estar en
                      sala de espera del día actual, con estado PENDIENTE, no tener
                      un triaje previo y además estar AGENDADA, CONFIRMADA o
                      REPROGRAMADA.
                    </p>
                  </IonText>
                ) : null}

                <div className="triage-form__actions">
                  <IonButton fill="outline" type="button" onClick={resetForm}>
                    Cancelar
                  </IonButton>
                  <IonButton type="submit" disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar triaje"}
                  </IonButton>
                </div>
              </form>
            </section>
          )}

          <section className="triage-table-card">
            <div className="triage-filters">
              <IonInput
                className="triage-field"
                fill="outline"
                placeholder="Buscar por motivo, signos, observaciones o cita..."
                value={query}
                onIonInput={(event) => setQuery(String(event.detail.value ?? ""))}
              />

              <IonSelect
                className="triage-field triage-field--select"
                interface="popover"
                value={urgencyFilter}
                onIonChange={(event) =>
                  setUrgencyFilter(String(event.detail.value ?? "todos"))
                }
              >
                <IonSelectOption value="todos">Todas las prioridades</IonSelectOption>
                {urgencyOptions.map((option) => (
                  <IonSelectOption key={option} value={option}>
                    {option}
                  </IonSelectOption>
                ))}
              </IonSelect>

              <IonSelect
                className="triage-field triage-field--select"
                interface="popover"
                value={appointmentFilter}
                onIonChange={(event) =>
                  setAppointmentFilter(String(event.detail.value ?? "0"))
                }
              >
                <IonSelectOption value="0">Todas las citas</IonSelectOption>
                {appointments.map((appointment) => (
                  <IonSelectOption
                    key={appointment.id}
                    value={String(appointment.id)}
                  >
                    {`${getAppointmentPetName(appointment, pets)} · ${getAppointmentLabel(appointment, services)}`}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>

            {error && (
              <IonText color="warning">
                <p className="triage-feedback">{error}</p>
              </IonText>
            )}

            {isLoading ? (
              <div className="triage-loading">
                <IonSpinner name="crescent" />
                <span>Cargando triajes...</span>
              </div>
            ) : (
              <>
                <div className="triage-table-wrapper">
                  <table className="triage-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Cita</th>
                        <th>Mascota</th>
                        <th>Motivo</th>
                        <th>Urgencia</th>
                        <th>Peso</th>
                        <th>Temperatura</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTriages.map((triage, index) => {
                        const appointment = appointments.find(
                          (item) => item.id === triage.appointmentId,
                        );

                        return (
                          <tr key={triage.id}>
                            <td>{index + 1}</td>
                            <td>
                              {appointment
                                ? getAppointmentLabel(appointment, services)
                                : `Cita #${triage.appointmentId}`}
                            </td>
                            <td>
                              {appointment
                                ? getAppointmentPetName(appointment, pets)
                                : "Sin mascota"}
                            </td>
                            <td>{triage.reasonForVisit}</td>
                            <td>
                              <span className={getUrgencyClass(triage.urgencyLevel)}>
                                {triage.urgencyLevel}
                              </span>
                            </td>
                            <td>{triage.weight} kg</td>
                            <td>{triage.temperature} °C</td>
                            <td>
                              <div className="triage-actions">
                                <button
                                  className="triage-action triage-action--view"
                                  type="button"
                                  onClick={() => handleViewDetail(triage.id)}
                                >
                                  <IonIcon icon={eyeOutline} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="triage-mobile-list">
                  {filteredTriages.map((triage, index) => {
                    const appointment = appointments.find(
                      (item) => item.id === triage.appointmentId,
                    );

                    return (
                      <article className="triage-mobile-card" key={triage.id}>
                        <div className="triage-mobile-card__top">
                          <span className="triage-mobile-card__index">
                            #{index + 1}
                          </span>
                          <span className={getUrgencyClass(triage.urgencyLevel)}>
                            {triage.urgencyLevel}
                          </span>
                        </div>

                        <h2>
                          {appointment
                            ? getAppointmentPetName(appointment, pets)
                            : `Mascota #${triage.appointmentId}`}
                        </h2>
                        <p>
                          {appointment
                            ? getAppointmentLabel(appointment, services)
                            : `Cita #${triage.appointmentId}`}
                        </p>
                        <p>{triage.reasonForVisit}</p>

                        <div className="triage-mobile-card__meta">
                          <span>{triage.weight} kg</span>
                          <strong>{triage.temperature} °C</strong>
                        </div>

                        <div className="triage-actions">
                          <button
                            className="triage-action triage-action--view"
                            type="button"
                            onClick={() => handleViewDetail(triage.id)}
                          >
                            <IonIcon icon={eyeOutline} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <footer className="triage-footer">
                  Total de triajes: {filteredTriages.length}
                </footer>
              </>
            )}
          </section>

          {(selectedTriage || isDetailLoading) && (
            <section className="triage-detail-card" ref={detailSectionRef}>
              <div className="triage-form-card__header">
                <div>
                  <h2>Detalle del triaje</h2>
                  <p>Información clínica inicial registrada para la cita.</p>
                </div>

                <IonButton
                  aria-label="Cerrar detalle"
                  className="triage-form-card__close"
                  fill="clear"
                  onClick={() => setSelectedTriage(null)}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              {isDetailLoading ? (
                <div className="triage-loading">
                  <IonSpinner name="crescent" />
                  <span>Cargando detalle...</span>
                </div>
              ) : selectedTriage ? (
                <div className="triage-detail-grid">
                  <div className="triage-detail-item">
                    <span>Cita</span>
                    <strong>
                      {appointments.find(
                        (item) => item.id === selectedTriage.appointmentId,
                      )
                        ? getAppointmentLabel(
                            appointments.find(
                              (item) => item.id === selectedTriage.appointmentId,
                            ) as AppointmentItem,
                            services,
                          )
                        : `Cita #${selectedTriage.appointmentId}`}
                    </strong>
                  </div>
                  <div className="triage-detail-item">
                    <span>Mascota</span>
                    <strong>
                      {appointments.find(
                        (item) => item.id === selectedTriage.appointmentId,
                      )
                        ? getAppointmentPetName(
                            appointments.find(
                              (item) => item.id === selectedTriage.appointmentId,
                            ) as AppointmentItem,
                            pets,
                          )
                        : "Sin mascota"}
                    </strong>
                  </div>
                  <div className="triage-detail-item">
                    <span>Urgencia</span>
                    <strong>{selectedTriage.urgencyLevel}</strong>
                  </div>
                  <div className="triage-detail-item">
                    <span>Peso</span>
                    <strong>{selectedTriage.weight} kg</strong>
                  </div>
                  <div className="triage-detail-item">
                    <span>Temperatura</span>
                    <strong>{selectedTriage.temperature} °C</strong>
                  </div>
                  <div className="triage-detail-item">
                    <span>Frecuencia cardiaca</span>
                    <strong>{selectedTriage.heartRate} lpm</strong>
                  </div>
                  <div className="triage-detail-item">
                    <span>Frecuencia respiratoria</span>
                    <strong>{selectedTriage.respiratoryRate} rpm</strong>
                  </div>
                  <div className="triage-detail-item">
                    <span>Registrado por</span>
                    <strong>{getAssistantName(selectedTriage.assistantId)}</strong>
                  </div>
                  <div className="triage-detail-item">
                    <span>Creado</span>
                    <strong>{formatDateTime(selectedTriage.createdAt)}</strong>
                  </div>
                  <div className="triage-detail-item triage-detail-item--full">
                    <span>Signos visibles</span>
                    <strong>{selectedTriage.visibleSigns || "Sin registro"}</strong>
                  </div>
                  <div className="triage-detail-item triage-detail-item--full">
                    <span>Observaciones</span>
                    <strong>{selectedTriage.observations || "Sin observaciones"}</strong>
                  </div>
                </div>
              ) : null}
            </section>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Triage;
