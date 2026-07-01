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
  CreateAppointmentRequest,
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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function toApiDateTime(value: string) {
  return new Date(value).toISOString();
}

function toInputDateTime(value: string) {
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function getVetFullName(vet: UserItem) {
  return `${vet.firstName} ${vet.lastName}`.trim();
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [pets, setPets] = useState<PetItem[]>([]);
  const [veterinarians, setVeterinarians] = useState<UserItem[]>([]);
  const [services, setServices] = useState<VetServiceItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
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
  const detailSectionRef = useRef<HTMLElement | null>(null);

  async function loadAppointments() {
    try {
      setIsLoading(true);
      setError("");

      const appointmentsData = await findAllAppointments();
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
    loadAppointments();
    loadFormDependencies();
  }, []);

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

    if (
      formData.petId <= 0 ||
      formData.veterinarianId <= 0 ||
      formData.serviceId <= 0 ||
      !formData.dateTime.trim()
    ) {
      setFormError("Completa mascota, veterinario, servicio y fecha.");
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
      await loadAppointments();
    } catch (err) {
      console.error("No se pudo registrar la cita:", err);
      setFormError("No se pudo registrar la cita. Inténtalo nuevamente.");
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
      await loadAppointments();
    } catch (err) {
      console.error("No se pudo actualizar la cita:", err);
      setError("No se pudo actualizar la cita.");
    } finally {
      setIsUpdatingAppointment(false);
    }
  }

  async function handleDeleteAppointment(appointment: AppointmentItem) {
    const confirmed = window.confirm(
      `¿Deseas eliminar la cita de "${appointment.mascota.nombre}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmittingAction(appointment.id);
      await deleteAppointment(appointment.id);

      if (selectedAppointment?.id === appointment.id) {
        setSelectedAppointment(null);
      }

      await loadAppointments();
    } catch (err) {
      console.error("No se pudo eliminar la cita:", err);
      setError("No se pudo eliminar la cita.");
    } finally {
      setIsSubmittingAction(null);
    }
  }

  const filteredAppointments = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesQuery =
        loweredQuery.length === 0 ||
        appointment.mascota.nombre.toLowerCase().includes(loweredQuery) ||
        appointment.veterinario.nombre.toLowerCase().includes(loweredQuery) ||
        appointment.veterinario.apellido.toLowerCase().includes(loweredQuery) ||
        appointment.servicio.nombre.toLowerCase().includes(loweredQuery);

      const matchesStatus =
        statusFilter === "todos" || appointment.estado === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [appointments, query, statusFilter]);

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
                    onIonChange={(event) =>
                      updateField(
                        "veterinarianId",
                        Number(event.detail.value ?? 0),
                      )
                    }
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
                    onIonChange={(event) =>
                      updateField("serviceId", Number(event.detail.value ?? 0))
                    }
                  >
                    {services.map((service) => (
                      <IonSelectOption key={service.id} value={service.id}>
                        {service.nombre}
                      </IonSelectOption>
                    ))}
                  </IonSelect>

                  <IonInput
                    className="appointments-field"
                    fill="outline"
                    label="Fecha y hora"
                    labelPlacement="stacked"
                    type="datetime-local"
                    value={formData.dateTime}
                    onIonInput={(event) =>
                      updateField("dateTime", String(event.detail.value ?? ""))
                    }
                  />
                </div>

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
                          <td>{appointment.mascota.nombre}</td>
                          <td>{`${appointment.veterinario.nombre} ${appointment.veterinario.apellido}`}</td>
                          <td>{appointment.servicio.nombre}</td>
                          <td>{formatDateTime(appointment.fechaHora)}</td>
                          <td>
                            <span className="appointments-status">
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
                        <span className="appointments-status">
                          {appointment.estado}
                        </span>
                      </div>

                      <h2>{appointment.mascota.nombre}</h2>
                      <p>{appointment.servicio.nombre}</p>

                      <div className="appointments-mobile-card__meta">
                        <span>{`${appointment.veterinario.nombre} ${appointment.veterinario.apellido}`}</span>
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
                    <strong>{selectedAppointment.mascota.nombre}</strong>
                  </div>
                  <div className="appointments-detail-item">
                    <span>Veterinario</span>
                    <strong>{`${selectedAppointment.veterinario.nombre} ${selectedAppointment.veterinario.apellido}`}</strong>
                  </div>
                  <div className="appointments-detail-item">
                    <span>Servicio</span>
                    <strong>{selectedAppointment.servicio.nombre}</strong>
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
                    <strong>{`${selectedAppointment.creadoPor.nombre} ${selectedAppointment.creadoPor.apellido}`}</strong>
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
                    <IonInput
                      className="appointments-field"
                      fill="outline"
                      label="Reprogramar fecha y hora"
                      labelPlacement="stacked"
                      type="datetime-local"
                      value={editDateTime}
                      onIonInput={(event) =>
                        setEditDateTime(String(event.detail.value ?? ""))
                      }
                    />

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
