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
  fitnessOutline,
  pencilOutline,
} from "ionicons/icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUserRole } from "../../auth/session";
import AppHeader from "../../components/AppHeader/AppHeader";
import { AppointmentItem } from "../../contracts/appointmentContract";
import {
  ClinicalAttentionItem,
  CreateClinicalAttentionRequest,
  UpdateClinicalAttentionRequest,
} from "../../contracts/clinicalAttentionContract";
import { PetItem } from "../../contracts/petContract";
import { TriageItem } from "../../contracts/triageContract";
import { VetServiceItem } from "../../contracts/vetServiceContract";
import { WaitingRoomItem } from "../../contracts/waitingRoomContract";
import {
  createClinicalAttention,
  findAllClinicalAttentions,
  findClinicalAttentionById,
  findClinicalAttentionsByAppointmentId,
  findClinicalAttentionsByPetId,
  updateClinicalAttention,
} from "../../services/clinicalAttentionService";
import { findAllAppointments } from "../../services/appointmentService";
import { findAllPets } from "../../services/petService";
import { findAllTriages } from "../../services/triageService";
import { findAllVetServices } from "../../services/vetCatalogService";
import { findWaitingRoomEntries } from "../../services/waitingRoomService";
import "./ClinicalAttention.css";

const initialFormData: CreateClinicalAttentionRequest = {
  appointmentId: 0,
  reasonForConsultation: "",
  symptoms: "",
  diagnosis: "",
  clinicalObservations: "",
  treatment: "",
  triageId: 0,
};

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
  pets: PetItem[],
  services: VetServiceItem[],
) {
  return `${getAppointmentPetName(appointment, pets)} · ${getAppointmentServiceName(
    appointment,
    services,
  )} · ${formatDateTime(appointment.fechaHora)}`;
}

function getAppointmentSummary(
  appointment: AppointmentItem,
  services: VetServiceItem[],
) {
  return `${getAppointmentServiceName(appointment, services)} · ${formatDateTime(
    appointment.fechaHora,
  )}`;
}

function getClinicalAttentionErrorMessage(error: unknown, fallback: string) {
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
    (typeof responseData === "string" ? responseData : "");

  return backendMessage || fallback;
}

const ClinicalAttention: React.FC = () => {
  const currentRole = getCurrentUserRole();
  const canManageClinicalAttention = currentRole === "VETERINARIO";
  const [clinicalAttentions, setClinicalAttentions] = useState<
    ClinicalAttentionItem[]
  >([]);
  const [allClinicalAttentions, setAllClinicalAttentions] = useState<
    ClinicalAttentionItem[]
  >([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [pets, setPets] = useState<PetItem[]>([]);
  const [triages, setTriages] = useState<TriageItem[]>([]);
  const [services, setServices] = useState<VetServiceItem[]>([]);
  const [waitingRoomEntries, setWaitingRoomEntries] = useState<WaitingRoomItem[]>(
    [],
  );
  const [query, setQuery] = useState("");
  const [petFilter, setPetFilter] = useState("0");
  const [appointmentFilter, setAppointmentFilter] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isDependenciesLoading, setIsDependenciesLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [editingAttentionId, setEditingAttentionId] = useState<number | null>(null);
  const [selectedAttention, setSelectedAttention] =
    useState<ClinicalAttentionItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [formData, setFormData] =
    useState<CreateClinicalAttentionRequest>(initialFormData);
  const detailSectionRef = useRef<HTMLElement | null>(null);

  async function loadDependencies() {
    try {
      setIsDependenciesLoading(true);

      const [
        appointmentsResult,
        petsResult,
        triagesResult,
        servicesResult,
        waitingRoomResult,
      ] = await Promise.allSettled([
        findAllAppointments(),
        findAllPets(),
        findAllTriages(),
        findAllVetServices(),
        findWaitingRoomEntries(),
      ]);

      setAppointments(
        appointmentsResult.status === "fulfilled" ? appointmentsResult.value : [],
      );
      setPets(petsResult.status === "fulfilled" ? petsResult.value : []);
      setTriages(triagesResult.status === "fulfilled" ? triagesResult.value : []);
      setServices(
        servicesResult.status === "fulfilled" ? servicesResult.value : [],
      );
      setWaitingRoomEntries(
        waitingRoomResult.status === "fulfilled" ? waitingRoomResult.value : [],
      );

      const failedDependencies = [
        appointmentsResult,
        petsResult,
        triagesResult,
        servicesResult,
        waitingRoomResult,
      ].filter((result) => result.status === "rejected").length;

      if (failedDependencies > 0) {
        setError(
          "Algunos catálogos auxiliares no se pudieron cargar por completo, pero la pantalla seguirá mostrando la información disponible.",
        );
      }
    } finally {
      setIsDependenciesLoading(false);
    }
  }

  async function loadClinicalAttentions() {
    try {
      setIsLoading(true);
      setError("");

      let items: ClinicalAttentionItem[];

      if (Number(appointmentFilter) > 0) {
        items = await findClinicalAttentionsByAppointmentId(
          Number(appointmentFilter),
        );
      } else if (Number(petFilter) > 0) {
        items = await findClinicalAttentionsByPetId(Number(petFilter));
      } else {
        items = await findAllClinicalAttentions();
      }

      setClinicalAttentions(items);
    } catch (err) {
      console.error("No se pudieron cargar las atenciones clinicas:", err);
      setError("No se pudieron cargar las atenciones clinicas del backend.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAllClinicalAttentionsForValidation() {
    try {
      const items = await findAllClinicalAttentions();
      setAllClinicalAttentions(items);
    } catch (err) {
      console.error(
        "No se pudieron cargar todas las atenciones clinicas para validacion:",
        err,
      );
    }
  }

  useEffect(() => {
    void loadDependencies();
  }, []);

  useEffect(() => {
    void loadClinicalAttentions();
  }, [appointmentFilter, petFilter]);

  useEffect(() => {
    void loadAllClinicalAttentionsForValidation();
  }, []);

  useEffect(() => {
    if (!selectedAttention && !isDetailLoading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      detailSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [selectedAttention, isDetailLoading]);

  const usedTriageIds = useMemo(
    () => new Set(allClinicalAttentions.map((item) => item.triageId)),
    [allClinicalAttentions],
  );

  const waitingRoomByAppointmentId = useMemo(
    () =>
      new Map(
        waitingRoomEntries.map((entry) => [entry.appointmentId, entry] as const),
      ),
    [waitingRoomEntries],
  );

  const availableTriages = useMemo(
    () =>
      triages.filter((triage) => {
        const isCurrentTriage = triage.id === formData.triageId;
        const waitingRoomEntry = waitingRoomByAppointmentId.get(
          triage.appointmentId,
        );

        return (
          (!usedTriageIds.has(triage.id) || isCurrentTriage) &&
          (isCurrentTriage || waitingRoomEntry?.status === "EN_ATENCION")
        );
      }),
    [formData.triageId, triages, usedTriageIds, waitingRoomByAppointmentId],
  );

  const selectedAppointment = useMemo(
    () =>
      appointments.find(
        (appointment) => appointment.id === formData.appointmentId,
      ) ?? null,
    [appointments, formData.appointmentId],
  );

  const filteredClinicalAttentions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return clinicalAttentions.filter((attention) => {
      const appointment = appointments.find(
        (appointmentItem) => appointmentItem.id === attention.appointmentId,
      );
      const pet = pets.find((petItem) => petItem.id === attention.petId);

      return (
        normalizedQuery.length === 0 ||
        attention.reasonForConsultation.toLowerCase().includes(normalizedQuery) ||
        attention.diagnosis.toLowerCase().includes(normalizedQuery) ||
        attention.treatment.toLowerCase().includes(normalizedQuery) ||
        (appointment
          ? getAppointmentLabel(appointment, pets, services)
              .toLowerCase()
              .includes(normalizedQuery)
          : false) ||
        (pet?.nombre.toLowerCase().includes(normalizedQuery) ?? false)
      );
    });
  }, [appointments, clinicalAttentions, pets, query, services]);

  function resetForm() {
    setFormData(initialFormData);
    setEditingAttentionId(null);
    setFormError("");
    setIsFormVisible(false);
  }

  function updateField<K extends keyof CreateClinicalAttentionRequest>(
    field: K,
    value: CreateClinicalAttentionRequest[K],
  ) {
    setFormData((current) => {
      const nextState = {
        ...current,
        [field]: value,
      };

      if (field === "triageId") {
        const triage = availableTriages.find((item) => item.id === Number(value));

        if (triage) {
          nextState.appointmentId = triage.appointmentId;
        } else {
          nextState.appointmentId = 0;
        }
      }

      return nextState;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      formData.triageId <= 0 ||
      formData.appointmentId <= 0 ||
      !formData.reasonForConsultation.trim() ||
      !formData.diagnosis.trim() ||
      !canManageClinicalAttention
    ) {
      setFormError(
        canManageClinicalAttention
          ? "Completa el triaje, el motivo de consulta y el diagnóstico."
          : "Solo los veterinarios pueden registrar atención clínica.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      if (editingAttentionId !== null) {
        await updateClinicalAttention(
          editingAttentionId,
          formData as UpdateClinicalAttentionRequest,
        );
      } else {
        await createClinicalAttention(formData);
      }

      resetForm();
      await loadClinicalAttentions();
      await loadAllClinicalAttentionsForValidation();
    } catch (err) {
      console.error("No se pudo guardar la atencion clinica:", err);
      setFormError(
        getClinicalAttentionErrorMessage(
          err,
          "No se pudo guardar la atencion clinica. Inténtalo nuevamente.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleViewDetail(attentionId: number) {
    try {
      setIsDetailLoading(true);
      const detail = await findClinicalAttentionById(attentionId);
      setSelectedAttention(detail);
    } catch (err) {
      console.error("No se pudo cargar el detalle de la atencion clinica:", err);
      setError("No se pudo cargar el detalle de la atencion clinica.");
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleStartEdit(attentionId: number) {
    try {
      setIsDetailLoading(true);
      const detail = await findClinicalAttentionById(attentionId);
      setEditingAttentionId(detail.id);
      setFormData({
        appointmentId: detail.appointmentId,
        triageId: detail.triageId,
        reasonForConsultation: detail.reasonForConsultation,
        symptoms: detail.symptoms,
        diagnosis: detail.diagnosis,
        clinicalObservations: detail.clinicalObservations,
        treatment: detail.treatment,
      });
      setIsFormVisible(true);
    } catch (err) {
      console.error("No se pudo cargar la atencion clinica para editar:", err);
      setError("No se pudo cargar la atencion clinica para editar.");
    } finally {
      setIsDetailLoading(false);
    }
  }

  return (
    <IonPage>
      <AppHeader title="Atención Clínica" />
      <IonContent>
        <div className="clinical-attention-screen">
          <section className="clinical-attention-hero">
            <div>
              <div className="clinical-attention-hero__title-row">
                <IonIcon icon={fitnessOutline} />
                <h1>Atención Clínica</h1>
              </div>
              <p>
                Registra el diagnóstico, tratamiento y observaciones finales de la
                consulta veterinaria.
              </p>
            </div>

            {canManageClinicalAttention ? (
              <IonButton
                className="clinical-attention-hero__cta"
                onClick={() => {
                  setFormError("");
                  setFormData(initialFormData);
                  setEditingAttentionId(null);
                  setIsFormVisible((current) => !current);
                }}
              >
                <IonIcon icon={addOutline} slot="start" />
                Nueva Atención
              </IonButton>
            ) : null}
          </section>

          {!canManageClinicalAttention && (
            <IonText color="medium">
              <p className="clinical-attention-feedback">
                El registro y edición de atención clínica está disponible solo para
                usuarios con rol VETERINARIO.
              </p>
            </IonText>
          )}

          {isFormVisible && (
            <section className="clinical-attention-form-card">
              <div className="clinical-attention-form-card__header">
                <div>
                  <h2>
                    {editingAttentionId !== null
                      ? "Editar atención clínica"
                      : "Registrar atención clínica"}
                  </h2>
                  <p>
                    {editingAttentionId !== null
                      ? "Actualiza la evolución y el plan terapéutico."
                      : "Completa el acto clínico a partir de un triaje registrado."}
                  </p>
                </div>

                <IonButton
                  aria-label="Cerrar formulario"
                  className="clinical-attention-form-card__close"
                  fill="clear"
                  onClick={resetForm}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              <form className="clinical-attention-form" onSubmit={handleSubmit}>
                <div className="clinical-attention-form__grid">
                  <IonSelect
                    className="clinical-attention-field clinical-attention-field--select clinical-attention-field--full"
                    interface="popover"
                    value={formData.triageId || undefined}
                    disabled={editingAttentionId !== null}
                    placeholder={
                      isDependenciesLoading
                        ? "Cargando triajes..."
                        : availableTriages.length > 0
                          ? "Selecciona un triaje"
                          : "No hay triajes listos para atención clínica"
                    }
                    onIonChange={(event) =>
                      updateField("triageId", Number(event.detail.value ?? 0))
                    }
                  >
                    {availableTriages.map((triage) => (
                      <IonSelectOption key={triage.id} value={triage.id}>
                        {(() => {
                          const appointment = appointments.find(
                            (item) => item.id === triage.appointmentId,
                          );

                          return appointment
                            ? `${getAppointmentPetName(appointment, pets)} · ${getAppointmentServiceName(
                                appointment,
                                services,
                              )} · ${formatDateTime(appointment.fechaHora)}`
                            : `Triaje #${triage.id} · ${triage.reasonForVisit}`;
                        })()}
                      </IonSelectOption>
                    ))}
                  </IonSelect>

                  <IonInput
                    className="clinical-attention-field clinical-attention-field--full"
                    fill="outline"
                    label="Datos de la cita"
                    labelPlacement="stacked"
                    readonly
                    value={
                      selectedAppointment
                        ? getAppointmentLabel(
                            selectedAppointment,
                            pets,
                            services,
                          )
                        : ""
                    }
                    placeholder="Se completará al seleccionar un triaje"
                  />

                  <IonInput
                    className="clinical-attention-field"
                    fill="outline"
                    label="Motivo de consulta"
                    labelPlacement="stacked"
                    value={formData.reasonForConsultation}
                    onIonInput={(event) =>
                      updateField(
                        "reasonForConsultation",
                        String(event.detail.value ?? ""),
                      )
                    }
                  />

                  <IonTextarea
                    className="clinical-attention-field"
                    fill="outline"
                    label="Síntomas"
                    labelPlacement="stacked"
                    autoGrow
                    value={formData.symptoms}
                    onIonInput={(event) =>
                      updateField("symptoms", String(event.detail.value ?? ""))
                    }
                  />

                  <IonTextarea
                    className="clinical-attention-field"
                    fill="outline"
                    label="Diagnóstico"
                    labelPlacement="stacked"
                    autoGrow
                    value={formData.diagnosis}
                    onIonInput={(event) =>
                      updateField("diagnosis", String(event.detail.value ?? ""))
                    }
                  />

                  <IonTextarea
                    className="clinical-attention-field"
                    fill="outline"
                    label="Observaciones clínicas"
                    labelPlacement="stacked"
                    autoGrow
                    value={formData.clinicalObservations}
                    onIonInput={(event) =>
                      updateField(
                        "clinicalObservations",
                        String(event.detail.value ?? ""),
                      )
                    }
                  />
                </div>

                <IonTextarea
                  className="clinical-attention-field"
                  fill="outline"
                  label="Tratamiento"
                  labelPlacement="stacked"
                  autoGrow
                  value={formData.treatment}
                  onIonInput={(event) =>
                    updateField("treatment", String(event.detail.value ?? ""))
                  }
                />

                {formError && (
                  <IonText color="danger">
                    <p className="clinical-attention-feedback">{formError}</p>
                  </IonText>
                )}

                {!isDependenciesLoading && availableTriages.length === 0 ? (
                  <IonText color="medium">
                    <p className="clinical-attention-feedback">
                      No hay triajes elegibles. Primero debe existir un triaje
                      registrado, la cita debe seguir en EN_ATENCION y además no
                      debe tener una atención clínica previa asociada.
                    </p>
                  </IonText>
                ) : null}

                <div className="clinical-attention-form__actions">
                  <IonButton fill="outline" type="button" onClick={resetForm}>
                    Cancelar
                  </IonButton>
                  <IonButton type="submit" disabled={isSaving}>
                    {isSaving
                      ? "Guardando..."
                      : editingAttentionId !== null
                        ? "Actualizar atención"
                        : "Guardar atención"}
                  </IonButton>
                </div>
              </form>
            </section>
          )}

          <section className="clinical-attention-table-card">
            <div className="clinical-attention-filters">
              <IonInput
                className="clinical-attention-field"
                fill="outline"
                placeholder="Buscar por motivo, diagnóstico, tratamiento o mascota..."
                value={query}
                onIonInput={(event) => setQuery(String(event.detail.value ?? ""))}
              />

              <IonSelect
                className="clinical-attention-field clinical-attention-field--select"
                interface="popover"
                value={petFilter}
                onIonChange={(event) =>
                  setPetFilter(String(event.detail.value ?? "0"))
                }
              >
                <IonSelectOption value="0">Todas las mascotas</IonSelectOption>
                {pets.map((pet) => (
                  <IonSelectOption key={pet.id} value={String(pet.id)}>
                    {pet.nombre}
                  </IonSelectOption>
                ))}
              </IonSelect>

              <IonSelect
                className="clinical-attention-field clinical-attention-field--select"
                interface="popover"
                value={appointmentFilter}
                onIonChange={(event) =>
                  setAppointmentFilter(String(event.detail.value ?? "0"))
                }
              >
                <IonSelectOption value="0">Todas las citas</IonSelectOption>
                {appointments.map((appointment) => (
                  <IonSelectOption key={appointment.id} value={String(appointment.id)}>
                    {getAppointmentLabel(appointment, pets, services)}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>

            {error && (
              <IonText color="warning">
                <p className="clinical-attention-feedback">{error}</p>
              </IonText>
            )}

            {isLoading ? (
              <div className="clinical-attention-loading">
                <IonSpinner name="crescent" />
                <span>Cargando atenciones clínicas...</span>
              </div>
            ) : (
              <>
                <div className="clinical-attention-table-wrapper">
                  <table className="clinical-attention-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Mascota</th>
                        <th>Datos de la Cita</th>
                        <th>Diagnóstico</th>
                        <th>Creado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClinicalAttentions.map((attention, index) => {
                        const appointment = appointments.find(
                          (appointmentItem) =>
                            appointmentItem.id === attention.appointmentId,
                        );
                        const petName =
                          pets.find((pet) => pet.id === attention.petId)?.nombre ||
                          appointment?.mascota.nombre ||
                          `Mascota #${attention.petId}`;

                        return (
                          <tr key={attention.id}>
                            <td>{index + 1}</td>
                            <td>{petName}</td>
                            <td>
                              {appointment
                                ? getAppointmentSummary(appointment, services)
                                : `Cita #${attention.appointmentId}`}
                            </td>
                            <td>{attention.diagnosis}</td>
                            <td>{formatDateTime(attention.createdAt)}</td>
                            <td>
                              <div className="clinical-attention-actions">
                                {canManageClinicalAttention ? (
                                  <button
                                    className="clinical-attention-action clinical-attention-action--edit"
                                    type="button"
                                    onClick={() => handleStartEdit(attention.id)}
                                  >
                                    <IonIcon icon={pencilOutline} />
                                  </button>
                                ) : null}
                                <button
                                  className="clinical-attention-action clinical-attention-action--view"
                                  type="button"
                                  onClick={() => handleViewDetail(attention.id)}
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

                <div className="clinical-attention-mobile-list">
                  {filteredClinicalAttentions.map((attention, index) => {
                    const appointment = appointments.find(
                      (appointmentItem) =>
                        appointmentItem.id === attention.appointmentId,
                    );
                    const petName =
                      pets.find((pet) => pet.id === attention.petId)?.nombre ||
                      appointment?.mascota.nombre ||
                      `Mascota #${attention.petId}`;

                    return (
                      <article
                        className="clinical-attention-mobile-card"
                        key={attention.id}
                      >
                        <div className="clinical-attention-mobile-card__top">
                          <span className="clinical-attention-mobile-card__index">
                            #{index + 1}
                          </span>
                          <span className="clinical-attention-mobile-card__meta-pill">
                            Triage #{attention.triageId}
                          </span>
                        </div>

                        <h2>{petName}</h2>
                        <p>{attention.reasonForConsultation}</p>

                        <div className="clinical-attention-mobile-card__meta">
                          <span>
                            {appointment
                              ? getAppointmentSummary(appointment, services)
                              : `Cita #${attention.appointmentId}`}
                          </span>
                          <strong>{formatDateTime(attention.createdAt)}</strong>
                        </div>

                        <div className="clinical-attention-actions">
                          {canManageClinicalAttention ? (
                            <button
                              className="clinical-attention-action clinical-attention-action--edit"
                              type="button"
                              onClick={() => handleStartEdit(attention.id)}
                            >
                              <IonIcon icon={pencilOutline} />
                            </button>
                          ) : null}
                          <button
                            className="clinical-attention-action clinical-attention-action--view"
                            type="button"
                            onClick={() => handleViewDetail(attention.id)}
                          >
                            <IonIcon icon={eyeOutline} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <footer className="clinical-attention-footer">
                  Total de atenciones clínicas: {filteredClinicalAttentions.length}
                </footer>
              </>
            )}
          </section>

          {(selectedAttention || isDetailLoading) && (
            <section
              className="clinical-attention-detail-card"
              ref={detailSectionRef}
            >
              <div className="clinical-attention-form-card__header">
                <div>
                  <h2>Detalle de la atención clínica</h2>
                  <p>Información ampliada del acto clínico seleccionado.</p>
                </div>

                <IonButton
                  aria-label="Cerrar detalle"
                  className="clinical-attention-form-card__close"
                  fill="clear"
                  onClick={() => setSelectedAttention(null)}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              {isDetailLoading ? (
                <div className="clinical-attention-loading">
                  <IonSpinner name="crescent" />
                  <span>Cargando detalle...</span>
                </div>
              ) : selectedAttention ? (
                <div className="clinical-attention-detail-grid">
                  <div className="clinical-attention-detail-item">
                    <span>Datos de la Cita</span>
                    <strong>
                      {appointments.find(
                        (appointment) =>
                          appointment.id === selectedAttention.appointmentId,
                      )
                        ? getAppointmentSummary(
                            appointments.find(
                              (appointment) =>
                                appointment.id === selectedAttention.appointmentId,
                            ) as AppointmentItem,
                            services,
                          )
                        : `Cita #${selectedAttention.appointmentId}`}
                    </strong>
                  </div>
                  <div className="clinical-attention-detail-item">
                    <span>Mascota</span>
                    <strong>
                      {pets.find((pet) => pet.id === selectedAttention.petId)
                        ?.nombre || `Mascota #${selectedAttention.petId}`}
                    </strong>
                  </div>
                  <div className="clinical-attention-detail-item">
                    <span>Motivo de consulta</span>
                    <strong>{selectedAttention.reasonForConsultation}</strong>
                  </div>
                  <div className="clinical-attention-detail-item">
                    <span>Síntomas</span>
                    <strong>{selectedAttention.symptoms}</strong>
                  </div>
                  <div className="clinical-attention-detail-item clinical-attention-detail-item--full">
                    <span>Diagnóstico</span>
                    <strong>{selectedAttention.diagnosis}</strong>
                  </div>
                  <div className="clinical-attention-detail-item clinical-attention-detail-item--full">
                    <span>Tratamiento</span>
                    <strong>{selectedAttention.treatment}</strong>
                  </div>
                  <div className="clinical-attention-detail-item clinical-attention-detail-item--full">
                    <span>Observaciones clínicas</span>
                    <strong>{selectedAttention.clinicalObservations}</strong>
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

export default ClinicalAttention;
