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
  closeOutline,
  listOutline,
  pauseOutline,
  pencilOutline,
  playOutline,
  trashOutline,
} from "ionicons/icons";
import React, { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/AppHeader/AppHeader";
import {
  createVetService,
  deleteVetService,
  findAllVetServices,
  findVetServiceById,
  toggleVetServiceStatus,
  updateVetService,
} from "../../services/vetCatalogService";
import {
  CreateVetServiceRequest,
  UpdateVetServiceRequest,
  VetServiceItem,
} from "../../contracts/vetServiceContract";
import { formatCurrency } from "../../utils/formatCurrency";
import "./VetServices.css";

const initialFormData: CreateVetServiceRequest = {
  name: "",
  description: "",
  durationMinutes: 0,
  referentialCost: 0,
};

const VetServices: React.FC = () => {
  const [services, setServices] = useState<VetServiceItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] =
    useState<CreateVetServiceRequest>(initialFormData);

  async function loadServices(filters?: {
    nombre?: string;
    soloActivos?: boolean;
  }) {
    try {
      setIsLoading(true);
      setError("");

      const vetServicesData = await findAllVetServices(filters);
      setServices(vetServicesData);
    } catch (err) {
      console.error("No se pudieron cargar los servicios:", err);
      setError("No se pudieron cargar los servicios del backend.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const normalizedQuery = query.trim();
    const filters = {
      nombre: normalizedQuery || undefined,
      soloActivos:
        statusFilter === "activos"
          ? true
          : statusFilter === "inactivos"
            ? false
            : undefined,
    };

    void loadServices(filters);
  }, [query, statusFilter]);

  function updateField<K extends keyof CreateVetServiceRequest>(
    field: K,
    value: CreateVetServiceRequest[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreateService(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      setFormError("Completa el nombre y la descripción del servicio.");
      return;
    }

    if (formData.durationMinutes <= 0 || formData.referentialCost <= 0) {
      setFormError("La duración y el costo deben ser mayores que cero.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      if (editingServiceId !== null) {
        await updateVetService(editingServiceId, formData as UpdateVetServiceRequest);
      } else {
        await createVetService(formData);
      }

      setFormData(initialFormData);
      setIsCreateFormVisible(false);
      setEditingServiceId(null);
      await loadServices();
    } catch (err) {
      console.error("No se pudo guardar el servicio:", err);
      setFormError("No se pudo guardar el servicio. Inténtalo nuevamente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStartEdit(service: VetServiceItem) {
    try {
      setIsSubmittingAction(service.id);
      setFormError("");

      const serviceDetail = await findVetServiceById(service.id);

      setEditingServiceId(service.id);
      setFormData({
        name: serviceDetail.nombre,
        description: serviceDetail.descripcion,
        durationMinutes: serviceDetail.duracionMinutos,
        referentialCost: serviceDetail.costoReferencial,
      });
      setIsCreateFormVisible(true);
    } catch (err) {
      console.error("No se pudo cargar el detalle del servicio:", err);
      setError("No se pudo cargar el detalle del servicio.");
    } finally {
      setIsSubmittingAction(null);
    }
  }

  async function handleToggleStatus(service: VetServiceItem) {
    try {
      setIsSubmittingAction(service.id);
      await toggleVetServiceStatus(service.id);
      await loadServices();
    } catch (err) {
      console.error("No se pudo cambiar el estado del servicio:", err);
      setError("No se pudo cambiar el estado del servicio.");
    } finally {
      setIsSubmittingAction(null);
    }
  }

  async function handleDeleteService(service: VetServiceItem) {
    const confirmed = window.confirm(
      `¿Deseas eliminar el servicio "${service.nombre}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmittingAction(service.id);
      await deleteVetService(service.id);
      await loadServices();
    } catch (err) {
      console.error("No se pudo eliminar el servicio:", err);
      setError("No se pudo eliminar el servicio.");
    } finally {
      setIsSubmittingAction(null);
    }
  }

  const filteredServices = useMemo(() => services, [services]);

  return (
    <IonPage>
      <AppHeader title="Servicios" />
      <IonContent>
        <div className="services-screen">
          <section className="services-hero">
            <div>
              <div className="services-hero__title-row">
                <IonIcon icon={listOutline} />
                <h1>Servicios</h1>
              </div>
              <p>Vista donde podrás revisar y gestionar los servicios veterinarios.</p>
            </div>

            <IonButton
              className="services-hero__cta"
              onClick={() => {
                setFormError("");
                setEditingServiceId(null);
                setFormData(initialFormData);
                setIsCreateFormVisible((current) => !current);
              }}
            >
              <IonIcon icon={addOutline} slot="start" />
              Nuevo Servicio
            </IonButton>
          </section>

          {isCreateFormVisible && (
            <section className="services-create-card">
              <div className="services-create-card__header">
                <div>
                  <h2>
                    {editingServiceId !== null
                      ? "Editar servicio"
                      : "Registrar nuevo servicio"}
                  </h2>
                  <p>
                    {editingServiceId !== null
                      ? "Actualiza los datos del servicio veterinario."
                      : "Completa los campos para guardar un servicio veterinario."}
                  </p>
                </div>

                <IonButton
                  aria-label="Cerrar formulario"
                  className="services-create-card__close"
                  fill="clear"
                  onClick={() => {
                    setFormError("");
                    setEditingServiceId(null);
                    setFormData(initialFormData);
                    setIsCreateFormVisible(false);
                  }}
                >
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              </div>

              <form className="services-create-form" onSubmit={handleCreateService}>
                <IonInput
                  className="services-filter"
                  fill="outline"
                  label="Nombre del servicio"
                  labelPlacement="stacked"
                  placeholder="Ej. Baño medicado"
                  value={formData.name}
                  onIonInput={(event) =>
                    updateField("name", String(event.detail.value ?? ""))
                  }
                />

                <IonTextarea
                  className="services-filter"
                  fill="outline"
                  label="Descripción"
                  labelPlacement="stacked"
                  placeholder="Describe brevemente el servicio"
                  value={formData.description}
                  autoGrow
                  onIonInput={(event) =>
                    updateField("description", String(event.detail.value ?? ""))
                  }
                />

                <div className="services-create-form__grid">
                  <IonInput
                    className="services-filter"
                    fill="outline"
                    label="Duración (min)"
                    labelPlacement="stacked"
                    type="number"
                    min="1"
                    value={String(formData.durationMinutes || "")}
                    onIonInput={(event) =>
                      updateField(
                        "durationMinutes",
                        Number(event.detail.value ?? 0),
                      )
                    }
                  />

                  <IonInput
                    className="services-filter"
                    fill="outline"
                    label="Costo referencial"
                    labelPlacement="stacked"
                    type="number"
                    min="1"
                    step="0.01"
                    value={String(formData.referentialCost || "")}
                    onIonInput={(event) =>
                      updateField(
                        "referentialCost",
                        Number(event.detail.value ?? 0),
                      )
                    }
                  />
                </div>

                {formError && (
                  <IonText color="danger">
                    <p className="services-feedback">{formError}</p>
                  </IonText>
                )}

                <div className="services-create-form__actions">
                  <IonButton
                    fill="outline"
                    type="button"
                    onClick={() => {
                      setEditingServiceId(null);
                      setFormData(initialFormData);
                      setFormError("");
                      setIsCreateFormVisible(false);
                    }}
                  >
                    Cancelar
                  </IonButton>

                  <IonButton type="submit" disabled={isSaving}>
                    {isSaving
                      ? "Guardando..."
                      : editingServiceId !== null
                        ? "Actualizar servicio"
                        : "Guardar servicio"}
                  </IonButton>
                </div>
              </form>
            </section>
          )}

          <section className="services-table-card">
            <div className="services-filters">
              <IonInput
                className="services-filter"
                fill="outline"
                labelPlacement="stacked"
                placeholder="Buscar por nombre..."
                value={query}
                onIonInput={(event) => setQuery(String(event.detail.value ?? ""))}
              />

              <IonSelect
                className="services-filter services-filter--select"
                interface="popover"
                value={statusFilter}
                onIonChange={(event) =>
                  setStatusFilter(String(event.detail.value ?? "todos"))
                }
              >
                <IonSelectOption value="todos">Todos</IonSelectOption>
                <IonSelectOption value="activos">Activos</IonSelectOption>
                <IonSelectOption value="inactivos">Inactivos</IonSelectOption>
              </IonSelect>
            </div>

            {error && (
              <IonText color="warning">
                <p className="services-feedback">{error}</p>
              </IonText>
            )}

            {isLoading ? (
              <div className="services-loading">
                <IonSpinner name="crescent" />
                <span>Cargando servicios...</span>
              </div>
            ) : (
              <>
                <div className="services-table-wrapper">
                  <table className="services-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Tiempo (Min)</th>
                        <th>Costo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((service, index) => (
                        <tr key={service.id}>
                          <td>{index + 1}</td>
                          <td>{service.nombre}</td>
                          <td>{service.descripcion}</td>
                          <td>{service.duracionMinutos}</td>
                          <td>{formatCurrency(service.costoReferencial)}</td>
                          <td>
                            <span
                              className={`services-status ${service.activo ? "services-status--active" : "services-status--paused"}`}
                            >
                              {service.activo ? "Activo" : "Pausado"}
                            </span>
                          </td>
                          <td>
                            <div className="services-actions">
                              <button
                                className="services-action services-action--edit"
                                type="button"
                                onClick={() => handleStartEdit(service)}
                                disabled={isSubmittingAction === service.id}
                              >
                                <IonIcon icon={pencilOutline} />
                              </button>
                              <button
                                className="services-action services-action--pause"
                                type="button"
                                onClick={() => handleToggleStatus(service)}
                                disabled={isSubmittingAction === service.id}
                              >
                                <IonIcon
                                  icon={service.activo ? pauseOutline : playOutline}
                                />
                              </button>
                              <button
                                className="services-action services-action--delete"
                                type="button"
                                onClick={() => handleDeleteService(service)}
                                disabled={isSubmittingAction === service.id}
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

                <div className="services-mobile-list">
                  {filteredServices.map((service, index) => (
                    <article className="services-mobile-card" key={service.id}>
                      <div className="services-mobile-card__top">
                        <span className="services-mobile-card__index">
                          #{index + 1}
                        </span>
                        <span
                          className={`services-status ${service.activo ? "services-status--active" : "services-status--paused"}`}
                        >
                          {service.activo ? "Activo" : "Pausado"}
                        </span>
                      </div>

                      <h2>{service.nombre}</h2>
                      <p>{service.descripcion}</p>

                      <div className="services-mobile-card__meta">
                        <span>{service.duracionMinutos} min</span>
                        <strong>{formatCurrency(service.costoReferencial)}</strong>
                      </div>

                      <div className="services-actions">
                        <button
                          className="services-action services-action--edit"
                          type="button"
                          onClick={() => handleStartEdit(service)}
                          disabled={isSubmittingAction === service.id}
                        >
                          <IonIcon icon={pencilOutline} />
                        </button>
                        <button
                          className="services-action services-action--pause"
                          type="button"
                          onClick={() => handleToggleStatus(service)}
                          disabled={isSubmittingAction === service.id}
                        >
                          <IonIcon
                            icon={service.activo ? pauseOutline : playOutline}
                          />
                        </button>
                        <button
                          className="services-action services-action--delete"
                          type="button"
                          onClick={() => handleDeleteService(service)}
                          disabled={isSubmittingAction === service.id}
                        >
                          <IonIcon icon={trashOutline} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <footer className="services-footer">
                  Total de servicios: {filteredServices.length}
                </footer>
              </>
            )}
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VetServices;
