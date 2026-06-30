import {
  calendarOutline,
  clipboardOutline,
  ellipsisHorizontalOutline,
  homeOutline,
  pawOutline,
  peopleOutline,
} from "ionicons/icons";
import { UserRole } from "../types/authType";

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
    key: "users",
    path: "/app/usuarios",
    label: "Usuarios",
    title: "Usuarios",
    description: "Espacio reservado para la gestión administrativa de usuarios.",
    icon: peopleOutline,
    roles: ["ADMINISTRADOR"],
    showInTab: true,
  },
  {
    key: "patients",
    path: "/app/pacientes",
    label: "Pacientes",
    title: "Pacientes",
    description: "Espacio reservado para el trabajo clínico del veterinario.",
    icon: pawOutline,
    roles: ["VETERINARIO"],
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
  {
    key: "more",
    path: "/app/mas",
    label: "Más",
    title: "Más",
    description: "Aquí podrás agrupar opciones secundarias y configuración.",
    icon: ellipsisHorizontalOutline,
    roles: ALL_ROLES,
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
