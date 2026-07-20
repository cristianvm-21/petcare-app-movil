# Análisis del Frontend y su Integración con la API REST

Fecha de revisión: 2026-07-16

## 1. Arquitectura actual

### Stack principal

- `React 19`
- `Ionic React 8`
- `TypeScript`
- `Axios`
- `React Router DOM 5`
- `Capacitor 8`
- `Vite 5`

### Organización del proyecto

La estructura en `src/` está separada por responsabilidad:

- `src/api`: funciones HTTP puras sobre `springbootApi`
- `src/services`: capa intermedia que transforma o simplifica respuestas para la UI
- `src/pages`: pantallas principales
- `src/layouts`: layout de tabs privadas
- `src/navigation`: configuración de rutas privadas por rol
- `src/routes`: utilidades de protección de rutas
- `src/contracts`: contratos TypeScript para request/response
- `src/types`: tipos reutilizables, hoy casi solo `UserRole`
- `src/components`: componentes compartidos como `AppHeader`
- `src/auth`: helpers de sesión
- `src/utils`: utilidades pequeñas

### Sistema de rutas

- El enrutamiento principal está en `src/App.tsx`.
- Las rutas públicas son `/login` y `/register`.
- Las rutas privadas cuelgan de `/app/*`.
- `AppTabs` renderiza las tabs y las rutas accesibles según el rol.
- La configuración por rol vive en `src/navigation/privateRoutes.ts`.

### Axios y URL base

La instancia HTTP está en `src/api/axiosHttp.ts`.

- `baseURL`: `https://petcare-backend-appmovil.onrender.com/api`
- Header por defecto: `Content-Type: application/json`
- Interceptor request: adjunta `Authorization: Bearer <token>` si existe `token` en `localStorage`
- Interceptor response: solo hace `console.log`, no transforma errores ni respuestas

### Manejo de JWT y refresh token

La sesión se apoya en `localStorage`:

- `token`
- `refreshToken`
- `username`
- `role`

Archivos relevantes:

- `src/services/authService.ts`
- `src/auth/session.ts`

Hallazgos:

- Sí existe almacenamiento de `refreshToken`, pero no existe flujo implementado de refresh automático.
- No se consume `POST /api/auth/refresh`.
- No se consume `POST /api/auth/logout`.
- No se consume `GET /api/auth/me`.

### Roles y permisos

- El tipo de rol está en `src/types/userRole.ts`.
- Roles actuales: `ADMINISTRADOR`, `VETERINARIO`, `ASISTENTE`, `DUENO`.
- `isAuthenticated()` valida que existan `token` y `role`.
- La autorización visual se resuelve en frontend por rol mediante `privateRoutes`.

### Estado global

No existe estrategia de estado global.

- No hay `Context`, `Redux`, `Zustand`, `store` ni hooks globales propios.
- Cada página maneja su propio estado con `useState`, `useEffect` y `useMemo`.

### Variables de entorno

No hay uso actual de variables de entorno de Vite.

- La URL del backend está hardcodeada en `axiosHttp.ts`.
- Esto complica cambiar entre backend local, Render y otros ambientes.

### Problemas de organización detectados

- La carpeta `src/contracts` mezcla requests, responses y modelos de lectura en un mismo archivo por módulo.
- Hay cierta mezcla de naming entre español y inglés: `nombre`/`name`, `activo`/`active`, `rol`/`role`.
- Algunas respuestas están tipadas de forma simplificada y no modelan paginación completa.
- Existe `src/routes/ProtectedRoute.tsx`, pero el flujo real de protección está resuelto directamente en `App.tsx`; hoy ese componente parece subutilizado.

## 2. Módulos implementados

| Módulo | Estado | Archivos principales | Observaciones |
| --- | --- | --- | --- |
| Autenticación | `IMPLEMENTADO CON POSIBLES INCOMPATIBILIDADES` | `pages/login`, `pages/register`, `api/authHttp.ts`, `services/authService.ts` | Login y registro funcionan en frontend, pero no usan `refresh`, `logout`, `me` y el contrato de login parece desalineado con backend actual. |
| Home / Dashboard | `PARCIALMENTE IMPLEMENTADO` | `pages/home/Home.tsx` | Consume datos de varios módulos para mostrar KPIs. Depende de endpoints administrativos que pueden no estar disponibles para todos los roles. |
| Usuarios | `IMPLEMENTADO CON POSIBLES INCOMPATIBILIDADES` | `pages/users`, `api/userHttp.ts`, `services/userService.ts` | CRUD UI completo en frontend, pero varias rutas no aparecen en el backend documentado del Sprint 2. |
| Dueños | `IMPLEMENTADO CON POSIBLES INCOMPATIBILIDADES` | `pages/owners`, `api/ownerHttp.ts`, `services/ownerService.ts` | CRUD y contactos implementados. Hay incompatibilidades claras en borrado de contactos y posible diferencia en filtros/paginación. |
| Mascotas | `IMPLEMENTADO` | `pages/pets`, `api/petHttp.ts`, `services/petService.ts` | CRUD, consulta por dueño y dueño principal ya integrados. |
| Servicios veterinarios | `IMPLEMENTADO` | `pages/VetServices`, `api/vetServicesHttp.ts`, `services/vetCatalogService.ts` | CRUD principal y toggle implementados. |
| Citas | `PARCIALMENTE IMPLEMENTADO` | `pages/appointments`, `api/appointmentHttp.ts`, `services/appointmentService.ts` | Lista, detalle, crear, reprogramar, cambiar estado y eliminar. No usa aún filtros avanzados ni disponibilidad ni consultas por mascota/veterinario. |
| Placeholders por rol | `PARCIALMENTE IMPLEMENTADO` | `pages/shared/SectionPlaceholder.tsx` | Existen rutas privadas futuras con vista placeholder. |

## 3. Endpoints consumidos actualmente

### Autenticación

| Método | Endpoint frontend | Archivo HTTP | Función HTTP | Servicio | Página | Auth | Rol aparente | Request | Response esperado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/auth/login` | `src/api/authHttp.ts` | `loginRequest` | `login` | `pages/login/Login.tsx` | No | Público | `LoginRequest { username, password }` | `LoginResponse { token, refreshToken, username, role }` |
| POST | `/auth/register` | `src/api/authHttp.ts` | `registerRequest` | `signUp` | `pages/register/Register.tsx` | No | Público | `RegisterRequest { username, password, firstName, lastName, email, phone, role }` | `RegisterResponse` |

### Usuarios

| Método | Endpoint frontend | Archivo HTTP | Función HTTP | Servicio | Página | Auth | Rol aparente | Request | Response esperado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/usuarios?page=0&size=100` | `src/api/userHttp.ts` | `httpGetUserAPI` | `findAllUsers` | `pages/users/Users.tsx`, `pages/home/Home.tsx` | Sí | `ADMINISTRADOR` | query opcional `soloActivos`, `rol` | `UserResponse { content: UserItem[] }` |
| GET | `/usuarios?page=0&size=100&soloActivos=true&rol=DUENO` | `src/api/userHttp.ts` | `httpGetUserAPI` | `findUsersByFilters` | `pages/owners/Owners.tsx` | Sí | `ADMINISTRADOR` | filtros en query | `UserResponse { content: UserItem[] }` |
| GET | `/usuarios/veterinarios` | `src/api/userHttp.ts` | `httpGetVeterinariansAPI` | `findVeterinarians` | `pages/appointments/Appointments.tsx` | Sí | `ADMINISTRADOR`, `ASISTENTE` | sin body | `VeterinarianResponse = UserItem[]` |
| POST | `/usuarios` | `src/api/userHttp.ts` | `httpPostUserAPI` | `createUser` | `pages/users/Users.tsx` | Sí | `ADMINISTRADOR` | `CreateUserRequest` | `UserItem` |
| PUT | `/usuarios/{id}` | `src/api/userHttp.ts` | `httpPutUserAPI` | `updateUser` | `pages/users/Users.tsx` | Sí | `ADMINISTRADOR` | `UpdateUserRequest` | `UserItem` |
| PATCH | `/usuarios/{id}/toggle` | `src/api/userHttp.ts` | `httpPatchUserAPI` | `toggleUserStatus` | `pages/users/Users.tsx` | Sí | `ADMINISTRADOR` | sin body | `UserItem` |
| DELETE | `/usuarios/{id}` | `src/api/userHttp.ts` | `httpDeleteUserAPI` | `deleteUser` | `pages/users/Users.tsx` | Sí | `ADMINISTRADOR` | sin body | vacío |

### Dueños

| Método | Endpoint frontend | Archivo HTTP | Función HTTP | Servicio | Página | Auth | Rol aparente | Request | Response esperado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/duenos?page=0&size=100` | `src/api/ownerHttp.ts` | `httpGetOwnerAPI` | `findAllOwners` | `pages/owners/Owners.tsx`, `pages/home/Home.tsx`, `pages/pets/Pets.tsx` | Sí | `ADMINISTRADOR` | sin body | `OwnerResponse { content: OwnerItem[] }` |
| GET | `/duenos/{id}` | `src/api/ownerHttp.ts` | `httpGetOwnerByIdAPI` | `findOwnerById` | `pages/owners/Owners.tsx` | Sí | `ADMINISTRADOR` | sin body | `OwnerItem` |
| GET | `/duenos/{id}/contactos` | `src/api/ownerHttp.ts` | `httpGetOwnerContactsAPI` | `findOwnerContacts` | `pages/owners/Owners.tsx` | Sí | `ADMINISTRADOR` | sin body | `OwnerContactsResponse` |
| POST | `/duenos` | `src/api/ownerHttp.ts` | `httpPostOwnerAPI` | `createOwner` | `pages/owners/Owners.tsx` | Sí | `ADMINISTRADOR` | `CreateOwnerRequest` | `OwnerItem` |
| PUT | `/duenos/{id}` | `src/api/ownerHttp.ts` | `httpPutOwnerAPI` | `updateOwner` | `pages/owners/Owners.tsx` | Sí | `ADMINISTRADOR` | `UpdateOwnerRequest` | `OwnerItem` |
| POST | `/duenos/{id}/contactos` | `src/api/ownerHttp.ts` | `httpPostOwnerContactAPI` | `createOwnerContact` | `pages/owners/Owners.tsx` | Sí | `ADMINISTRADOR` | `CreateOwnerContactRequest` | `OwnerContactItem` |
| PATCH | `/duenos/{id}/toggle` | `src/api/ownerHttp.ts` | `httpPatchOwnerAPI` | `toggleOwnerStatus` | `pages/owners/Owners.tsx` | Sí | `ADMINISTRADOR` | sin body | `OwnerItem` |
| DELETE | `/duenos/{id}` | `src/api/ownerHttp.ts` | `httpDeleteOwnerAPI` | `deleteOwner` | `pages/owners/Owners.tsx` | Sí | `ADMINISTRADOR` | sin body | vacío |
| DELETE | `/duenos/{id}/contactos` | `src/api/ownerHttp.ts` | `httpDeleteOwnerContactsAPI` | `deleteOwnerContacts` | `pages/owners/Owners.tsx` | Sí | `ADMINISTRADOR` | sin body | vacío |

### Mascotas

| Método | Endpoint frontend | Archivo HTTP | Función HTTP | Servicio | Página | Auth | Rol aparente | Request | Response esperado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/mascotas?page=0&size=100` | `src/api/petHttp.ts` | `httpGetPetAPI` | `findAllPets` | `pages/pets/Pets.tsx`, `pages/home/Home.tsx`, `pages/appointments/Appointments.tsx` | Sí | `ADMINISTRADOR`, `VETERINARIO`, `DUENO`, `ASISTENTE` | sin body | `PetResponse { content }` |
| GET | `/mascotas/{id}` | `src/api/petHttp.ts` | `httpGetPetByIdAPI` | `findPetById` | `pages/pets/Pets.tsx` | Sí | `ADMINISTRADOR`, `VETERINARIO` | sin body | `PetItem` |
| GET | `/mascotas/dueno/{duenoId}` | `src/api/petHttp.ts` | `httpGetPetsByOwnerIdAPI` | `findPetsByOwnerId` | `pages/pets/Pets.tsx` | Sí | `ADMINISTRADOR`, `DUENO` | sin body | `PetsByOwnerResponse` |
| GET | `/mascotas/{id}/dueno-principal` | `src/api/petHttp.ts` | `httpGetPetOwnerPrincipalAPI` | `findPetOwnerPrincipal` | `pages/pets/Pets.tsx` | Sí | `ADMINISTRADOR`, `VETERINARIO` | sin body | `OwnerItem` |
| POST | `/mascotas` | `src/api/petHttp.ts` | `httpPostPetAPI` | `createPet` | `pages/pets/Pets.tsx` | Sí | `ADMINISTRADOR`, `VETERINARIO` | `CreatePetRequest` | `PetItem` |
| PUT | `/mascotas/{id}` | `src/api/petHttp.ts` | `httpPutPetAPI` | `updatePet` | `pages/pets/Pets.tsx` | Sí | `ADMINISTRADOR`, `VETERINARIO` | `UpdatePetRequest` | `PetItem` |
| PATCH | `/mascotas/{id}/toggle` | `src/api/petHttp.ts` | `httpPatchPetAPI` | `togglePetStatus` | `pages/pets/Pets.tsx` | Sí | `ADMINISTRADOR`, `VETERINARIO` | sin body | `PetItem` |
| DELETE | `/mascotas/{id}` | `src/api/petHttp.ts` | `httpDeletePetAPI` | `deletePet` | `pages/pets/Pets.tsx` | Sí | `ADMINISTRADOR`, `VETERINARIO` | sin body | vacío |

### Servicios veterinarios

| Método | Endpoint frontend | Archivo HTTP | Función HTTP | Servicio | Página | Auth | Rol aparente | Request | Response esperado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/servicios?page=0&size=100` | `src/api/vetServicesHttp.ts` | `httpGetVetServicesAPI` | `findAllVetServices` | `pages/VetServices/VetServices.tsx`, `pages/home/Home.tsx`, `pages/appointments/Appointments.tsx` | Sí | `ADMINISTRADOR`, `ASISTENTE` | sin body | `VetServiceResponse { content }` |
| POST | `/servicios` | `src/api/vetServicesHttp.ts` | `httpPostVetServiceAPI` | `createVetService` | `pages/VetServices/VetServices.tsx` | Sí | `ADMINISTRADOR`, `ASISTENTE` | `CreateVetServiceRequest` | `VetServiceItem` |
| PUT | `/servicios/{id}` | `src/api/vetServicesHttp.ts` | `httpPutVetServiceAPI` | `updateVetService` | `pages/VetServices/VetServices.tsx` | Sí | `ADMINISTRADOR`, `ASISTENTE` | `UpdateVetServiceRequest` | `VetServiceItem` |
| PATCH | `/servicios/{id}/toggle` | `src/api/vetServicesHttp.ts` | `httpPatchVetServiceAPI` | `toggleVetServiceStatus` | `pages/VetServices/VetServices.tsx` | Sí | `ADMINISTRADOR`, `ASISTENTE` | sin body | `VetServiceItem` |
| DELETE | `/servicios/{id}` | `src/api/vetServicesHttp.ts` | `httpDeleteVetServiceAPI` | `deleteVetService` | `pages/VetServices/VetServices.tsx` | Sí | `ADMINISTRADOR`, `ASISTENTE` | sin body | vacío |

### Citas

| Método | Endpoint frontend | Archivo HTTP | Función HTTP | Servicio | Página | Auth | Rol aparente | Request | Response esperado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/citas?page=0&size=100` | `src/api/appointmentHttp.ts` | `httpGetAppointmentAPI` | `findAllAppointments` | `pages/appointments/Appointments.tsx`, `pages/home/Home.tsx` | Sí | `ADMINISTRADOR`, `VETERINARIO`, `ASISTENTE` | sin body | `AppointmentResponse { content }` |
| GET | `/citas/{id}` | `src/api/appointmentHttp.ts` | `httpGetAppointmentByIdAPI` | `findAppointmentById` | `pages/appointments/Appointments.tsx` | Sí | `ADMINISTRADOR`, `VETERINARIO`, `ASISTENTE` | sin body | `AppointmentItem` |
| POST | `/citas` | `src/api/appointmentHttp.ts` | `httpPostAppointmentAPI` | `createAppointment` | `pages/appointments/Appointments.tsx` | Sí | `ADMINISTRADOR`, `ASISTENTE` | `CreateAppointmentRequest` | `AppointmentItem` |
| PUT | `/citas/{id}/reprogramar` | `src/api/appointmentHttp.ts` | `httpPutAppointmentRescheduleAPI` | `reprogramAppointment` | `pages/appointments/Appointments.tsx` | Sí | `ADMINISTRADOR`, `ASISTENTE` | `ReprogramAppointmentRequest` | `AppointmentItem` |
| PUT | `/citas/{id}/estado` | `src/api/appointmentHttp.ts` | `httpPutAppointmentStatusAPI` | `updateAppointmentStatus` | `pages/appointments/Appointments.tsx` | Sí | `ADMINISTRADOR`, `ASISTENTE`, `VETERINARIO` | `UpdateAppointmentStatusRequest` | `AppointmentItem` |
| DELETE | `/citas/{id}` | `src/api/appointmentHttp.ts` | `httpDeleteAppointmentAPI` | `deleteAppointment` | `pages/appointments/Appointments.tsx` | Sí | `ADMINISTRADOR`, `ASISTENTE` | sin body | vacío |

## 4. Comparación frontend vs backend actual

### Compatibles

| Endpoint frontend | Estado |
| --- | --- |
| `POST /api/auth/login` | `COMPATIBLE` en ruta y método, pero request/response deben verificarse con DTO real actual |
| `POST /api/auth/register` | `COMPATIBLE` en ruta y método, request/response por verificar |
| `GET /api/duenos` | `COMPATIBLE` |
| `GET /api/duenos/{id}` | `COMPATIBLE` |
| `GET /api/duenos/{id}/contactos` | `COMPATIBLE` |
| `POST /api/duenos` | `COMPATIBLE` |
| `PUT /api/duenos/{id}` | `COMPATIBLE` |
| `POST /api/duenos/{id}/contactos` | `COMPATIBLE` |
| `PATCH /api/duenos/{id}/toggle` | `COMPATIBLE` |
| `DELETE /api/duenos/{id}` | `COMPATIBLE` |
| `GET /api/mascotas` | `COMPATIBLE` |
| `GET /api/mascotas/{id}` | `COMPATIBLE` |
| `GET /api/mascotas/{id}/dueno-principal` | `COMPATIBLE` |
| `GET /api/mascotas/dueno/{duenoId}` | `COMPATIBLE` |
| `POST /api/mascotas` | `COMPATIBLE` |
| `PUT /api/mascotas/{id}` | `COMPATIBLE` |
| `PATCH /api/mascotas/{id}/toggle` | `COMPATIBLE` |
| `DELETE /api/mascotas/{id}` | `COMPATIBLE` |
| `GET /api/servicios` | `COMPATIBLE` |
| `POST /api/servicios` | `COMPATIBLE` |
| `PUT /api/servicios/{id}` | `COMPATIBLE` |
| `PATCH /api/servicios/{id}/toggle` | `COMPATIBLE` |
| `DELETE /api/servicios/{id}` | `COMPATIBLE` |
| `GET /api/citas` | `COMPATIBLE` |
| `GET /api/citas/{id}` | `COMPATIBLE` |
| `POST /api/citas` | `COMPATIBLE` |
| `PUT /api/citas/{id}/reprogramar` | `COMPATIBLE` |
| `PUT /api/citas/{id}/estado` | `COMPATIBLE` |
| `DELETE /api/citas/{id}` | `COMPATIBLE` |
| `GET /api/usuarios/veterinarios` | `COMPATIBLE` en ruta y método; paginación de respuesta debe verificarse |

### Incompatibilidades o dudas relevantes

| Endpoint frontend | Estado | Observación |
| --- | --- | --- |
| `GET /api/usuarios` | `ENDPOINT NO VERIFICADO` | No aparece en `.agents/ENDPOINTS.md`. El frontend lo usa ampliamente. |
| `GET /api/usuarios?soloActivos=true&rol=DUENO` | `ENDPOINT NO VERIFICADO` | El frontend depende de filtros por query para seleccionar usuarios dueños; el backend documentado no lo lista. |
| `POST /api/usuarios` | `COMPATIBLE` | Pero backend documenta `RegisterRequest`; el frontend usa `CreateUserRequest`. Debe verificarse equivalencia exacta. |
| `PUT /api/usuarios/{id}` | `ENDPOINT ELIMINADO` o `ENDPOINT NO VERIFICADO` | No aparece en el backend documentado. |
| `PATCH /api/usuarios/{id}/toggle` | `RUTA MODIFICADA` | Backend actual documenta `PATCH /api/usuarios/{id}/estado` con body `{ active }`. |
| `DELETE /api/usuarios/{id}` | `ENDPOINT ELIMINADO` o `ENDPOINT NO VERIFICADO` | No aparece en el backend documentado. |
| `DELETE /api/duenos/{id}/contactos` | `RUTA MODIFICADA` | Backend actual documenta `DELETE /api/duenos/contactos/{contactoId}`. El frontend hoy borra por dueño, no por contacto. |
| `GET /api/usuarios/veterinarios` respuesta `UserItem[]` | `RESPONSE MODIFICADO` potencial | Backend documenta `Pageable` de entrada; es probable respuesta paginada, no arreglo plano. |
| `POST /api/auth/login` request `{ username, password }` | `REQUEST MODIFICADO` potencial | Backend documenta “email y contraseña”; el frontend envía `username`. |
| `LoginResponse` con `refreshToken` en body | `RESPONSE MODIFICADO` potencial | Backend documenta refresh token en cookies. |

## 5. Revisión de tipos e interfaces

### Hallazgos generales

- El frontend usa `src/contracts` en lugar de separar claramente:
  - `CreateRequest`
  - `UpdateRequest`
  - `Item`
  - `ListResponse`
  - `DetailResponse`
- En varios módulos esta separación parcial ya existe, pero no de forma consistente.

### Desalineaciones detectadas

#### Autenticación

- `LoginRequest` usa `username`, mientras que backend documenta autenticación por email.
- `LoginResponse` espera `refreshToken` en body; backend documenta que emite refresh token en cookie.
- `RegisterRequest` usa `firstName`, `lastName`, `phone`, `role`; backend real puede seguir otra convención si hereda DTO de Spring con nombres distintos.

#### Usuarios

- `UserItem` usa propiedades en inglés:
  - `firstName`
  - `lastName`
  - `role`
  - `active`
- En otros módulos el frontend consume usuarios anidados con propiedades en español:
  - `nombre`
  - `apellido`
  - `rol`
  - `activo`
- Esto revela que el backend devuelve formas distintas según endpoint o que el frontend modeló dos variantes incompatibles.

#### Dueños

- `OwnerItem.usuario` contiene campos en español, pero la creación/actualización usa request en inglés.
- `OwnerContactItem` mezcla dos nombres para la misma información:
  - `nombre` y `name`
  - `telefono` y `phone`
  - `relacion` y `relation`
- Esto es útil como parche, pero indica inconsistencia de contratos.

#### Mascotas

- El contrato está bastante alineado con el backend actual.
- `PetsByOwnerResponse = PetResponse | PetItem[]` existe porque la capa frontend no confía en una sola forma de respuesta. Esto sugiere inestabilidad del endpoint o una decisión defensiva del frontend.

#### Servicios veterinarios

- `VetServiceResponse` modela paginación solo parcialmente.
- Faltan contratos separados para detalle si en Sprint 2 aparece `GET /servicios/{id}` con más campos.

#### Citas

- `AppointmentItem` modela usuarios anidados con `password`, campo que la UI no debería necesitar.
- No están tipados aún los endpoints de:
  - disponibilidad
  - citas por mascota
  - citas por veterinario

### Recomendación de organización futura

Por módulo, separar al menos:

- `XxxItem`
- `XxxDetailResponse`
- `XxxListResponse`
- `CreateXxxRequest`
- `UpdateXxxRequest`

En autenticación:

- `LoginRequest`
- `LoginResponse`
- `RegisterRequest`
- `AuthMeResponse`
- `RefreshTokenResponse` o contrato equivalente si el backend lo expone por body

## 6. Funcionalidades pendientes de implementar

### Autenticación

- Integrar `POST /api/auth/refresh`
- Integrar `POST /api/auth/logout`
- Integrar `GET /api/auth/me`
- Definir estrategia de expiración y recuperación de sesión

### Usuarios

- Verificar si existe realmente `GET /api/usuarios`
- Verificar si siguen existiendo `PUT /api/usuarios/{id}` y `DELETE /api/usuarios/{id}`
- Adaptar cambio de estado al endpoint nuevo `PATCH /api/usuarios/{id}/estado`
- Manejar posibles respuestas paginadas

### Dueños

- Ajustar borrado de contactos a `DELETE /api/duenos/contactos/{contactoId}`
- Exponer filtros reales del backend:
  - `soloActivos`
  - `nombre`
  - `dni`
- Soportar paginación si el listado crece

### Mascotas

- Aún no se usan estos endpoints del Sprint 2:
  - `POST /api/mascotas/{mascotaId}/vincular-dueno/{duenoId}`
  - `PATCH /api/mascotas/{mascotaId}/cambiar-dueno-principal`
  - `GET /api/mascotas/{mascotaId}/transferencias`

### Servicios veterinarios

- Aún no se usa `GET /api/servicios/{id}`
- No hay filtros del backend integrados:
  - `soloActivos`
  - `nombre`

### Citas

- Aún no se usan:
  - `GET /api/citas/disponibilidad`
  - `GET /api/citas/mascota/{mascotaId}`
  - `GET /api/citas/veterinario/{veterinarioId}`
- No están integrados filtros backend:
  - `mascotaId`
  - `veterinarioId`
  - `servicioId`
  - `estado`
  - `fechaDesde`
  - `fechaHasta`

### Módulos Sprint 2 no consumidos todavía

- Disponibilidad de veterinarios
- Bloqueos de veterinarios
- Triaje
- Atenciones clínicas
- Historial de transferencias
- Sala de espera

## 7. Oportunidades de ampliación con Sprint 2

### Home

- Mostrar métricas reales por rango de fechas usando filtros backend
- Separar dashboard según rol con endpoints específicos
- Mostrar disponibilidad del equipo veterinario
- Mostrar citas de hoy y estados de sala de espera

### Usuarios

- Pantalla específica para veterinarios activos usando `/api/usuarios/veterinarios`
- Gestión de disponibilidad y bloqueos enlazada desde usuario veterinario

### Dueños

- Búsqueda por nombre o DNI apoyada en query params del backend
- Gestión granular de contactos por `contactoId`

### Mascotas

- Historial de dueños / transferencias
- Dueños múltiples y cambio de dueño principal
- Vista filtrada para el rol `DUENO`

### Citas

- Agenda filtrada por veterinario
- Historial por mascota
- Validación de horarios disponibles antes de crear o reprogramar
- Estados más controlados desde flujos guiados

### Nuevos módulos

- Triaje como flujo previo a atención
- Atenciones clínicas con historial por mascota
- Sala de espera conectada al estado de la cita

## 8. Resumen ejecutivo

El frontend ya tiene una base funcional sólida para `auth`, `usuarios`, `dueños`, `mascotas`, `servicios` y `citas`, con una arquitectura simple y entendible basada en `api -> service -> page`. El principal problema actual no es de estructura visual sino de alineación contractual con el backend del Sprint 2.

Los módulos mejor alineados hoy son `mascotas`, `servicios veterinarios` y `citas`. Los módulos con mayor riesgo de incompatibilidad son `usuarios` y parte de `autenticación`, porque el frontend consume rutas o contratos que no coinciden claramente con el documento actual del backend.

La siguiente fase recomendada es una normalización por módulo:

1. confirmar contratos reales del backend para `auth` y `usuarios`
2. corregir rutas incompatibles
3. separar mejor requests/responses en `src/contracts`
4. empezar a consumir endpoints nuevos del Sprint 2 por prioridad de negocio

## 9. Plan por fases

Este plan prioriza primero la estabilidad de autenticación y de los módulos ya operativos. La idea es evitar una refactorización masiva y avanzar por bloques cerrados que se puedan probar de forma independiente.

### Fase 1. Estabilización de autenticación y base HTTP

Objetivo:

- Asegurar que el frontend pueda autenticarse de forma consistente con el backend actual.
- Dejar lista la base técnica para el resto de módulos.

Alcance:

- Verificar contrato real de `POST /api/auth/login`
- Confirmar si el backend autentica con `email` o `username`
- Ajustar `LoginRequest` y `LoginResponse` si hoy están desalineados
- Validar el manejo de `token`, `refreshToken` y `role`
- Mover la `baseURL` a variables de entorno
- Preparar estrategia mínima de errores HTTP reutilizable

Archivos probables:

- `src/api/axiosHttp.ts`
- `src/api/authHttp.ts`
- `src/services/authService.ts`
- `src/auth/session.ts`
- `src/utils/httpErrorMessage.ts`
- `vite.config.ts`

Resultado esperado:

- Login y registro funcionando contra el backend actual sin ambigüedad de contrato
- Configuración de backend desacoplada del código hardcodeado

### Fase 2. Normalización del módulo Usuarios

Objetivo:

- Resolver el módulo con mayor riesgo de incompatibilidad frente al Sprint 2.

Alcance:

- Confirmar qué endpoints de usuarios siguen vigentes realmente
- Adaptar el cambio de estado desde `/usuarios/{id}/toggle` hacia `/usuarios/{id}/estado` si corresponde
- Verificar si `GET /api/usuarios`, `PUT /api/usuarios/{id}` y `DELETE /api/usuarios/{id}` existen o deben replantearse
- Ajustar contratos `CreateUserRequest`, `UpdateUserRequest`, `UserItem` y respuesta paginada si aplica
- Validar el endpoint de veterinarios y su respuesta real

Archivos probables:

- `src/api/userHttp.ts`
- `src/services/userService.ts`
- `src/contracts/userContract.ts`
- `src/pages/users/Users.tsx`
- `src/pages/appointments/Appointments.tsx`
- `src/pages/owners/Owners.tsx`
- `src/pages/home/Home.tsx`

Resultado esperado:

- Módulo `Usuarios` alineado con backend Sprint 2
- Sin dependencia de rutas no verificadas

### Fase 3. Ajuste de Dueños y contactos

Objetivo:

- Corregir el flujo de gestión de dueños, especialmente contactos y selección de usuario asociado.

Alcance:

- Confirmar contrato real de `POST /api/duenos`
- Revisar si el backend filtra usuarios dueños o si ese soporte sigue siendo válido
- Corregir borrado de contactos para usar `DELETE /api/duenos/contactos/{contactoId}`
- Ajustar tipos de `OwnerContactItem` para evitar duplicidad `nombre/name`
- Integrar filtros backend de `duenos` si conviene: `soloActivos`, `nombre`, `dni`

Archivos probables:

- `src/api/ownerHttp.ts`
- `src/services/ownerService.ts`
- `src/contracts/ownerContract.ts`
- `src/pages/owners/Owners.tsx`

Resultado esperado:

- Gestión de dueños estable
- Contactos alineados con el backend actual

### Fase 4. Consolidación de Mascotas

Objetivo:

- Mantener el módulo de mascotas estable y luego aprovechar endpoints nuevos del Sprint 2.

Alcance:

- Revisar contratos y filtros actuales del listado
- Confirmar consistencia de `PetsByOwnerResponse`
- Incorporar, solo si el negocio lo necesita en esta etapa:
  - vincular dueño adicional
  - cambiar dueño principal
  - historial de transferencias

Archivos probables:

- `src/api/petHttp.ts`
- `src/services/petService.ts`
- `src/contracts/petContract.ts`
- `src/pages/pets/Pets.tsx`

Resultado esperado:

- Módulo `Mascotas` estable sobre backend Sprint 2
- Capacidad de ampliar relaciones dueño-mascota sin romper CRUD actual

### Fase 5. Consolidación de Servicios veterinarios

Objetivo:

- Dejar el catálogo de servicios consistente y listo para reutilización desde citas y dashboard.

Alcance:

- Revisar si el listado debe usar filtros backend (`soloActivos`, `nombre`)
- Confirmar paginación y contrato del listado
- Evaluar si hace falta consumir `GET /api/servicios/{id}`
- Ordenar contratos para `create`, `update` y `response`

Archivos probables:

- `src/api/vetServicesHttp.ts`
- `src/services/vetCatalogService.ts`
- `src/contracts/vetServiceContract.ts`
- `src/pages/VetServices/VetServices.tsx`
- `src/pages/home/Home.tsx`

Resultado esperado:

- Catálogo estable y reutilizable desde otras pantallas

### Fase 6. Evolución del módulo Citas

Objetivo:

- Completar el módulo de citas con filtros y consultas específicas del Sprint 2.

Alcance:

- Integrar filtros de listado:
  - `mascotaId`
  - `veterinarioId`
  - `servicioId`
  - `estado`
  - `fechaDesde`
  - `fechaHasta`
- Integrar `GET /api/citas/disponibilidad`
- Integrar `GET /api/citas/mascota/{mascotaId}`
- Integrar `GET /api/citas/veterinario/{veterinarioId}`
- Revisar contratos de `AppointmentItem` para no depender de campos innecesarios como `password`

Archivos probables:

- `src/api/appointmentHttp.ts`
- `src/services/appointmentService.ts`
- `src/contracts/appointmentContract.ts`
- `src/pages/appointments/Appointments.tsx`
- `src/pages/home/Home.tsx`

Resultado esperado:

- Agenda más útil para operación real
- Menor carga manual en selección y seguimiento de citas

### Fase 7. Dashboard Home orientado por rol

Objetivo:

- Convertir Home en un panel robusto, usando únicamente datos confirmados para cada perfil.

Alcance:

- Separar indicadores por rol
- Evitar que Home dependa de endpoints no confirmados para ciertos perfiles
- Reutilizar filtros y agregados disponibles en citas, usuarios, servicios, mascotas y dueños
- Ajustar fallback visual cuando un módulo no esté permitido para el rol autenticado

Archivos probables:

- `src/pages/home/Home.tsx`
- `src/navigation/privateRoutes.ts`
- `src/layouts/AppTabs.tsx`

Resultado esperado:

- Home consistente con permisos reales
- Menos errores por llamadas innecesarias desde dashboard

### Fase 8. Nuevos módulos del Sprint 2

Objetivo:

- Incorporar funcionalidades nuevas sin tocar la base ya estabilizada.

Alcance sugerido:

- Disponibilidad veterinaria
- Bloqueos veterinarios
- Triaje
- Atenciones clínicas
- Sala de espera

Orden recomendado dentro de esta fase:

1. Disponibilidad veterinaria
2. Bloqueos veterinarios
3. Sala de espera
4. Triaje
5. Atenciones clínicas

Resultado esperado:

- Expansión funcional del sistema sin reabrir módulos ya cerrados

## 10. Orden recomendado de ejecución

Si se busca avanzar sin asumir demasiado riesgo, el orden recomendado es:

1. Fase 1: autenticación y base HTTP
2. Fase 2: usuarios
3. Fase 3: dueños
4. Fase 4: mascotas
5. Fase 5: servicios veterinarios
6. Fase 6: citas
7. Fase 7: home por rol
8. Fase 8: módulos nuevos del Sprint 2

## 11. Criterio para cerrar cada fase

Cada fase debería cerrarse solo cuando cumpla esto:

- Los endpoints del módulo estén confirmados contra el backend actual
- Los contratos TypeScript estén alineados con request y response reales
- La UI del módulo funcione sin depender de rutas no verificadas
- Las pantallas relacionadas sigan operativas después del ajuste
- El módulo pueda probarse de forma aislada antes de pasar al siguiente
