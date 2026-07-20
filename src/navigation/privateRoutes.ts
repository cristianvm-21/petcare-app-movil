import {
  calendarOutline,
  clipboardOutline,
  homeOutline,
  medkitOutline,
  pawOutline,
  peopleOutline,
  personCircleOutline,
  pulseOutline,
} from "ionicons/icons";
import { UserRole } from "../types/userRole";

export interface PrivateRouteConfig {
  key: string;
  path: string;
  label: string;
  title: string;
  description: string;
  icon: string;
  roles: UserRole[];
  showInTab?: boolean;
}

const ALL_ROLES: UserRole[] = [
  "ADMINISTRADOR",
  "VETERINARIO",
  "ASISTENTE",
  "DUENO",
];

export const privateRoutes: PrivateRouteConfig[] = [
  {
    key: "home",
    path: "/app/home",
    label: "Home",
    title: "Inicio",
    description: "Resumen principal de la aplicación.",
    icon: homeOutline,
    roles: ALL_ROLES,
    showInTab: true,
  },
  {
    key: "services",
    path: "/app/servicios",
    label: "Servicios",
    title: "Servicios",
    description: "Aquí podrás mostrar los servicios veterinarios disponibles.",
    icon: medkitOutline,
    roles: ["ADMINISTRADOR", "ASISTENTE"],
    showInTab: true,
  },
  {
    key: "appointments",
    path: "/app/citas",
    label: "Citas",
    title: "Citas",
    description: "Aquí podrás trabajar el flujo de citas del personal.",
    icon: calendarOutline,
    roles: ["ADMINISTRADOR", "VETERINARIO", "ASISTENTE"],
    showInTab: true,
  },
  {
    key: "triage",
    path: "/app/triaje",
    label: "Triaje",
    title: "Triaje",
    description: "Evaluación clínica inicial y priorización del paciente.",
    icon: pulseOutline,
    roles: ["ADMINISTRADOR", "VETERINARIO"],
    showInTab: true,
  },
  {
    key: "users",
    path: "/app/usuarios",
    label: "Usuarios",
    title: "Usuarios",
    description: "Espacio reservado para la gestión administrativa de usuarios.",
    icon: personCircleOutline,
    roles: ["ADMINISTRADOR"],
    showInTab: true,
  },
  {
    key: "patients",
    path: "/app/mascotas",
    label: "Mascotas",
    title: "Mascotas",
    description: "Espacio reservado para el trabajo clínico del veterinario.",
    icon: pawOutline,
    roles: ["ADMINISTRADOR", "VETERINARIO"],
    showInTab: true,
  },
  {
    key: "owners",
    path: "/app/duenos",
    label: "Dueños",
    title: "Dueños",
    description: "Espacio reservado para la gestión de los dueños de mascotas.",
    icon: peopleOutline,
    roles: ["ADMINISTRADOR"],
    showInTab: true,
  },
  {
    key: "schedule",
    path: "/app/agenda",
    label: "Agenda",
    title: "Agenda",
    description: "Espacio reservado para la agenda operativa del asistente.",
    icon: clipboardOutline,
    roles: ["ASISTENTE"],
    showInTab: true,
  },
  {
    key: "owner-appointments",
    path: "/app/mis-citas",
    label: "Mis Citas",
    title: "Mis Citas",
    description: "Espacio reservado para las citas del dueño y su mascota.",
    icon: calendarOutline,
    roles: ["DUENO"],
    showInTab: true,
  },
  {
    key: "owner-pets",
    path: "/app/mascotas",
    label: "Mascotas",
    title: "Mascotas",
    description: "Espacio reservado para el historial y seguimiento de mascotas.",
    icon: pawOutline,
    roles: ["DUENO"],
    showInTab: true,
  },
];

export function getTabsForRole(role: UserRole | null) {
  if (!role) {
    return [];
  }

  return privateRoutes.filter(
    (route) => route.showInTab && route.roles.includes(role),
  );
}

export function getDefaultPrivateRoute(role: UserRole | null) {
  return getTabsForRole(role)[0]?.path ?? "/app/home";
}
