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
} from "@ionic/react";
import {
  addOutline,
  listOutline,
  pauseOutline,
  pencilOutline,
  trashOutline,
} from "ionicons/icons";
import React, { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/AppHeader/AppHeader";
import { findAllVetServices } from "../../services/vetCatalogService";
import { VetServiceItem } from "../../contracts/vetServiceContract";
import { formatCurrency } from "../../utils/formatCurrency";
import "./VetServices.css";

const fallbackServices: VetServiceItem[] = [
  {
    id: 1,
    nombre: "Consulta General",
    descripcion: "Revisión médica general para la mascota",
    duracionMinutos: 30,
    costoReferencial: 80,
    activo: true,
  },
  {
    id: 2,
    nombre: "Vacunación",
    descripcion: "Aplicación de vacunas según calendario",
    duracionMinutos: 20,
    costoReferencial: 50,
    activo: true,
  },
  {
    id: 3,
    nombre: "Desparasitación",
    descripcion: "Tratamiento interno y externo preventivo",
    duracionMinutos: 15,
    costoReferencial: 30,
    activo: true,
  },
  
];

const vetServices: React.FC = () => {
  const [vetServices, setVetServices] = useState<VetServiceItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        setIsLoading(true);
        setError("");

        const vetServicesData = await findAllVetServices();

        if (vetServicesData.length > 0) {
          setVetServices(vetServicesData);
        }
      } catch (err) {
        console.error("No se pudieron cargar los servicios:", err);

        setError("No se pudieron cargar los servicios del backend. Se muestran datos de ejemplo.");

      } finally {
        setIsLoading(false);
      }
    }

  }, []);

  const filteredServices = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase();

    return vetServices.filter((service) => {
      const matchesQuery =
        loweredQuery.length === 0 ||
        service.nombre.toLowerCase().includes(loweredQuery) ||
        service.descripcion.toLowerCase().includes(loweredQuery);

      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "activos" && service.activo) ||
        (statusFilter === "inactivos" && !service.activo);

      return matchesQuery && matchesStatus;
    });
  }, [query, vetServices, statusFilter]);

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

            <IonButton className="services-hero__cta">
              <IonIcon icon={addOutline} slot="start" />
              Nuevo Servicio
            </IonButton>
          </section>

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
                              >
                                <IonIcon icon={pencilOutline} />
                              </button>
                              <button
                                className="services-action services-action--pause"
                                type="button"
                              >
                                <IonIcon icon={pauseOutline} />
                              </button>
                              <button
                                className="services-action services-action--delete"
                                type="button"
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
                        >
                          <IonIcon icon={pencilOutline} />
                        </button>
                        <button
                          className="services-action services-action--pause"
                          type="button"
                        >
                          <IonIcon icon={pauseOutline} />
                        </button>
                        <button
                          className="services-action services-action--delete"
                          type="button"
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

export default vetServices;
