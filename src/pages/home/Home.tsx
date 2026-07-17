import {
  IonContent,
  IonIcon,
  IonPage,
  IonSpinner,
  IonText,
} from "@ionic/react";
import {
  calendarClearOutline,
  checkmarkCircleOutline,
  medkitOutline,
  pawOutline,
  peopleOutline,
  pulseOutline,
  sparklesOutline,
  timeOutline,
} from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUserRole } from "../../auth/session";
import AppHeader from "../../components/AppHeader/AppHeader";
import { AppointmentItem } from "../../contracts/appointmentContract";
import { OwnerItem } from "../../contracts/ownerContract";
import { PetItem } from "../../contracts/petContract";
import { UserItem } from "../../contracts/userContract";
import { VetServiceItem } from "../../contracts/vetServiceContract";
import { findAllAppointments } from "../../services/appointmentService";
import { findAllOwners } from "../../services/ownerService";
import { findAllPets } from "../../services/petService";
import { findAllUsers } from "../../services/userService";
import { findAllVetServices } from "../../services/vetCatalogService";
import "./Home.css";

interface HomeDataState {
  appointments: AppointmentItem[];
  owners: OwnerItem[];
  pets: PetItem[];
  services: VetServiceItem[];
  users: UserItem[];
}

interface SummaryCard {
  key: string;
  label: string;
  value: string;
  hint: string;
  icon: string;
}

const initialDataState: HomeDataState = {
  appointments: [],
  owners: [],
  pets: [],
  services: [],
  users: [],
};

function formatCompactDateTime(value: string) {
  const date = new Date(value);
  const datePart = date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
  });
  const timePart = date.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    date: datePart,
    time: timePart,
  };
}

function isToday(dateValue: string) {
  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

const Home: React.FC = () => {
  const currentRole = getCurrentUserRole();
  const [dashboardData, setDashboardData] =
    useState<HomeDataState>(initialDataState);
  const [isLoading, setIsLoading] = useState(true);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setWarning("");

        const canLoadAppointments =
          currentRole === "ADMINISTRADOR" ||
          currentRole === "VETERINARIO" ||
          currentRole === "ASISTENTE";
        const canLoadOwners = currentRole === "ADMINISTRADOR";
        const canLoadPets =
          currentRole === "ADMINISTRADOR" || currentRole === "VETERINARIO";
        const canLoadServices =
          currentRole === "ADMINISTRADOR" || currentRole === "ASISTENTE";
        const canLoadUsers = currentRole === "ADMINISTRADOR";

        const [
          appointmentsResult,
          ownersResult,
          petsResult,
          servicesResult,
          usersResult,
        ] = await Promise.allSettled([
          canLoadAppointments
            ? findAllAppointments()
            : Promise.resolve([] as AppointmentItem[]),
          canLoadOwners ? findAllOwners() : Promise.resolve([] as OwnerItem[]),
          canLoadPets ? findAllPets() : Promise.resolve([] as PetItem[]),
          canLoadServices
            ? findAllVetServices()
            : Promise.resolve([] as VetServiceItem[]),
          canLoadUsers ? findAllUsers() : Promise.resolve([] as UserItem[]),
        ]);

        const nextData: HomeDataState = {
          appointments:
            appointmentsResult.status === "fulfilled"
              ? appointmentsResult.value
              : [],
          owners: ownersResult.status === "fulfilled" ? ownersResult.value : [],
          pets: petsResult.status === "fulfilled" ? petsResult.value : [],
          services:
            servicesResult.status === "fulfilled" ? servicesResult.value : [],
          users: usersResult.status === "fulfilled" ? usersResult.value : [],
        };

        const failedCalls = [
          appointmentsResult,
          ownersResult,
          petsResult,
          servicesResult,
          usersResult,
        ].filter((result) => result.status === "rejected").length;

        setDashboardData(nextData);

        if (failedCalls > 0) {
          setWarning(
            "Algunos indicadores no se pudieron cargar para este perfil, pero el panel seguirá mostrando la información disponible.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [currentRole]);

  const dashboardMetrics = useMemo(() => {
    const { appointments, owners, pets, services, users } = dashboardData;
    const activeUsers = users.filter((user) => user.active).length;
    const activeOwners = owners.filter((owner) => owner.activo).length;
    const activePets = pets.filter((pet) => pet.activo).length;
    const activeServices = services.filter((service) => service.activo).length;
    const appointmentsToday = appointments.filter((appointment) =>
      isToday(appointment.fechaHora),
    ).length;
    const pendingAppointments = appointments.filter((appointment) =>
      ["AGENDADA", "CONFIRMADA", "REPROGRAMADA"].includes(appointment.estado),
    ).length;

    const cards: SummaryCard[] = [];

    if (appointments.length > 0) {
      cards.push({
        key: "appointments",
        label: "Agenda Programada",
        value: String(pendingAppointments),
        hint: `${appointmentsToday} citas programadas para hoy`,
        icon: calendarClearOutline,
      });
    }

    if (pets.length > 0) {
      cards.push({
        key: "pets",
        label: "Mascotas Activas",
        value: String(activePets),
        hint: `${pets.length - activePets} registros inactivos`,
        icon: pawOutline,
      });
    }

    if (services.length > 0) {
      cards.push({
        key: "services",
        label: "Servicios Disponibles",
        value: String(activeServices),
        hint: `${services.length} servicios cargados en catálogo`,
        icon: medkitOutline,
      });
    }

    if (owners.length > 0) {
      cards.push({
        key: "owners",
        label: "Dueños",
        value: String(activeOwners),
        hint: `${owners.length} perfiles registrados`,
        icon: peopleOutline,
      });
    }

    if (users.length > 0 && currentRole === "ADMINISTRADOR") {
      cards.push({
        key: "users",
        label: "Usuarios Operativos",
        value: String(activeUsers),
        hint: `${users.length - activeUsers} cuentas inactivas`,
        icon: checkmarkCircleOutline,
      });
    }

    return cards.slice(0, 4);
  }, [currentRole, dashboardData]);

  const businessInsights = useMemo(() => {
    const { appointments, pets, services, users } = dashboardData;

    const statusCounts = appointments.reduce<Record<string, number>>(
      (accumulator, appointment) => {
        accumulator[appointment.estado] =
          (accumulator[appointment.estado] ?? 0) + 1;
        return accumulator;
      },
      {},
    );

    const statusEntries = Object.entries(statusCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);

    const speciesCounts = pets.reduce<Record<string, number>>(
      (accumulator, pet) => {
        accumulator[pet.especie] = (accumulator[pet.especie] ?? 0) + 1;
        return accumulator;
      },
      {},
    );

    const speciesEntries = Object.entries(speciesCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const roleCounts = users.reduce<Record<string, number>>(
      (accumulator, user) => {
        accumulator[user.role] = (accumulator[user.role] ?? 0) + 1;
        return accumulator;
      },
      {},
    );

    const roleEntries = Object.entries(roleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const nextAppointments = [...appointments]
      .filter((appointment) => new Date(appointment.fechaHora).getTime() >= Date.now())
      .sort(
        (left, right) =>
          new Date(left.fechaHora).getTime() -
          new Date(right.fechaHora).getTime(),
      )
      .slice(0, 4);

    const avgServiceCost =
      services.length > 0
        ? Math.round(
            services.reduce(
              (total, service) => total + service.costoReferencial,
              0,
            ) / services.length,
          )
        : 0;

    return {
      avgServiceCost,
      nextAppointments,
      roleEntries,
      speciesEntries,
      statusEntries,
    };
  }, [dashboardData]);

  const heroSummary = useMemo(() => {
    const totalRecords =
      dashboardData.appointments.length +
      dashboardData.pets.length +
      dashboardData.owners.length +
      dashboardData.services.length +
      dashboardData.users.length;

    const roleLabel =
      currentRole === "ADMINISTRADOR"
        ? "Administrador"
        : currentRole === "VETERINARIO"
          ? "Veterinario"
          : currentRole === "ASISTENTE"
            ? "Asistente"
            : "Vista del propietario";

    return {
      roleLabel,
      totalRecords,
    };
  }, [currentRole, dashboardData]);

  return (
    <IonPage>
      <AppHeader title="Inicio" />
      <IonContent>
        <div className="home-screen">
          {warning && (
            <IonText color="medium">
              <p className="home-screen__warning">{warning}</p>
            </IonText>
          )}

          <section className="home-panels">
            <article className="home-panel home-panel--hero">
              <div className="home-hero__copy">
                <div className="home-hero__eyebrow">
                  <IonIcon icon={sparklesOutline} />
                  <span>{heroSummary.roleLabel}</span>
                </div>

                <h1>Panel del negocio</h1>
                <p>
                  Un resumen visual para seguir citas, catálogo y actividad de la
                  veterinaria desde una sola pantalla.
                </p>

                <div className="home-hero__chips">
                  <span>{dashboardData.appointments.length} citas registradas</span>
                  <span>{dashboardData.pets.length} mascotas en seguimiento</span>
                  <span>{dashboardData.services.length} servicios en catálogo</span>
                </div>
              </div>

              <div className="home-hero__spotlight">
                {isLoading ? (
                  <div className="home-hero__loading">
                    <IonSpinner name="crescent" />
                    <span>Construyendo el dashboard...</span>
                  </div>
                ) : (
                  <>
                    <div className="home-hero__spotlight-value">
                      {heroSummary.totalRecords}
                    </div>
                    <span className="home-hero__spotlight-label">
                      Registros en el panel
                    </span>
                    <div className="home-hero__spotlight-ring">
                      <div className="home-hero__spotlight-core">
                        <IonIcon icon={pulseOutline} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </article>

            <div className="home-panel-grid">
              <article className="home-panel home-panel--stats">
                <div className="home-panel__header">
                  <div>
                    <span>Resumen General</span>
                    <h2>Estado actual</h2>
                  </div>
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>

                {isLoading ? (
                  <div className="home-panel__loading">
                    <IonSpinner name="crescent" />
                  </div>
                ) : dashboardMetrics.length > 0 ? (
                  <div className="home-stats-grid">
                    {dashboardMetrics.map((card) => (
                      <article className="home-stat-card" key={card.key}>
                        <div className="home-stat-card__icon">
                          <IonIcon icon={card.icon} />
                        </div>
                        <strong>{card.value}</strong>
                        <h3>{card.label}</h3>
                        <p>{card.hint}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="home-panel__empty">
                    No hay indicadores disponibles para este perfil todavía.
                  </div>
                )}
              </article>

              <article className="home-panel home-panel--timeline">
                <div className="home-panel__header">
                  <div>
                    <span>Próximas Citas</span>
                    <h2>Agenda cercana</h2>
                  </div>
                  <IonIcon icon={timeOutline} />
                </div>

                {isLoading ? (
                  <div className="home-panel__loading">
                    <IonSpinner name="crescent" />
                  </div>
                ) : businessInsights.nextAppointments.length > 0 ? (
                  <div className="home-timeline">
                    {businessInsights.nextAppointments.map((appointment) => (
                      <article className="home-timeline__item" key={appointment.id}>
                        <div className="home-timeline__time">
                          <span>{formatCompactDateTime(appointment.fechaHora).date}</span>
                          <strong>{formatCompactDateTime(appointment.fechaHora).time}</strong>
                        </div>
                        <div className="home-timeline__content">
                          <strong>{appointment.mascota.nombre}</strong>
                          <span>{appointment.servicio.nombre}</span>
                          <small>{`Veterinario: ${appointment.veterinario.nombre} ${appointment.veterinario.apellido}`}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="home-panel__empty">
                    No hay citas próximas registradas en este momento.
                  </div>
                )}
              </article>
            </div>

            <div className="home-panel-grid home-panel-grid--insights">
              <article className="home-panel home-panel--insight">
                <div className="home-panel__header">
                  <div>
                    <span>Citas</span>
                    <h2>Resumen de Citas</h2>
                  </div>
                  <IonIcon icon={calendarClearOutline} />
                </div>

                {businessInsights.statusEntries.length > 0 ? (
                  <div className="home-breakdown">
                    {businessInsights.statusEntries.map(([status, count]) => {
                      const total = dashboardData.appointments.length || 1;
                      const width = `${Math.max(10, Math.round((count / total) * 100))}%`;

                      return (
                        <div className="home-breakdown__row" key={status}>
                          <div className="home-breakdown__labels">
                            <span>{status}</span>
                            <strong>{count}</strong>
                          </div>
                          <div className="home-breakdown__track">
                            <div
                              className="home-breakdown__fill"
                              style={{ width }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="home-panel__empty">
                    Todavía no hay estados de citas para resumir.
                  </div>
                )}
              </article>

              <article className="home-panel home-panel--insight">
                <div className="home-panel__header">
                  <div>
                    <span>Base de Pacientes</span>
                    <h2>Especies registradas</h2>
                  </div>
                  <IonIcon icon={pawOutline} />
                </div>

                {businessInsights.speciesEntries.length > 0 ? (
                  <div className="home-insight-list">
                    {businessInsights.speciesEntries.map(([species, count]) => (
                      <div className="home-insight-list__item" key={species}>
                        <strong>{species}</strong>
                        <div className="home-insight-list__badge">{count}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="home-panel__empty">
                    Aún no hay suficientes mascotas para generar tendencias.
                  </div>
                )}
              </article>

              <article className="home-panel home-panel--insight">
                <div className="home-panel__header">
                  <div>
                    <span>Capacidad del Equipo</span>
                    <h2>Resumen de usuarios</h2>
                  </div>
                  <IonIcon icon={peopleOutline} />
                </div>

                <div className="home-insight-stack">
                  {businessInsights.roleEntries.length > 0 ? (
                    <div className="home-insight-stack__block">
                      <h3>Distribución por rol</h3>
                      {businessInsights.roleEntries.map(([role, count]) => (
                        <div className="home-mini-row" key={role}>
                          <span>{role}</span>
                          <strong>{count}</strong>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {dashboardData.services.length > 0 ? (
                    <div className="home-insight-stack__block">
                      <h3>Catálogo de servicios</h3>
                      <div className="home-mini-row">
                        <span>Servicios activos</span>
                        <strong>
                          {dashboardData.services.filter((service) => service.activo)
                            .length}
                        </strong>
                      </div>
                    </div>
                  ) : null}

                  {businessInsights.roleEntries.length === 0 &&
                  dashboardData.services.length === 0 ? (
                    <div className="home-panel__empty">
                      No hay suficiente información para construir este bloque.
                    </div>
                  ) : null}
                </div>
              </article>
            </div>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
