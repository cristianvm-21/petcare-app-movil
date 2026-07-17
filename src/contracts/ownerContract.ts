export interface OwnerUserItem {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
  activo: boolean;
}

export interface OwnerItem {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  usuario?: OwnerUserItem;
  activo: boolean;
}

export interface OwnerContactItem {
  id?: number;
  nombre: string;
  telefono: string;
  relacion: string;
}

export interface CreateOwnerRequest {
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  userId: number;
}

export type UpdateOwnerRequest = CreateOwnerRequest;

export interface CreateOwnerContactRequest {
  name: string;
  phone: string;
  relation: string;
}

export interface OwnerResponse {
  content: OwnerItem[];
}

export interface OwnerApiUserItem {
  id: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  rol?: string;
  activo?: boolean;
  names?: string;
  lastNames?: string;
  phone?: string;
  active?: boolean;
}

export interface OwnerApiItem {
  id: number;
  nombre?: string;
  apellido?: string;
  dni: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
  phone?: string;
  address?: string;
  active?: boolean;
  usuario?: OwnerApiUserItem | null;
}

export interface OwnerApiResponse {
  content: OwnerApiItem[];
}

export interface OwnerContactApiItem {
  id?: number;
  ownerId?: number;
  nombre?: string;
  telefono?: string;
  relacion?: string;
  name?: string;
  phone?: string;
  relation?: string;
}

export interface OwnerContactsPageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface OwnerContactsPagedResponse {
  content: OwnerContactApiItem[];
  page?: OwnerContactsPageInfo;
}

export type OwnerContactsResponse =
  | OwnerContactApiItem[]
  | OwnerContactsPagedResponse;
