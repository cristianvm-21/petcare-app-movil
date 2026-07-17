export interface OwnerUserItem {
  id: number;
  username: string;
  password: string;
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

export interface OwnerContactsPageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface OwnerContactsPagedResponse {
  content: OwnerContactItem[];
  page?: OwnerContactsPageInfo;
}

export type OwnerContactsResponse =
  | OwnerContactItem[]
  | OwnerContactsPagedResponse;
