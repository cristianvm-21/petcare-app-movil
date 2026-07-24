# PetCare Frontend

![Ionic React](https://img.shields.io/badge/Ionic%20React-8-3880FF?logo=ionic)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)


## Descripción
Aplicación web para la gestión de una clínica veterinaria. Permite administrar citas, mascotas, dueños, servicios y usuarios del sistema.

## Tecnologías

- **Ionic 7** con TypeScript (strict mode habilitado)
- **Vite 8** como bundler
- **Axios** para consumo de API (interceptor con refresh automático, cola de promesas y recuperación de sesión)
- **npm** como gestor de paquetes
- **CSS** estilos personalizados

## Características

- Autenticación con refresh de tokens y control de acceso por rol (ADMINISTRADOR, VETERINARIO, ASISTENTE, DUENO)
- **Interceptor resiliente**: refresh automático incluido en `/api/auth/me` para recuperar sesión tras inactividad
- **Cola de promesas** en interceptor para evitar race conditions en refresh de tokens simultáneos
- **Sesión estable**: no destruye cookies en error de refresh, solo despacha evento `auth:session-expired`
- **Sesiones simultáneas**: soporta múltiples dispositivos/navegadores con el mismo usuario
- Dashboard con resumen del negocio
- CRUD completo de servicios
- Gestión de citas con reprogramación y cancelación
- Administración de mascotas con vinculación a dueños y cambio de dueño principal
- Gestión de dueños y contactos de emergencia
- Sala de espera con registro de llegada y cambio de estado
- Triaje clínico con signos vitales y nivel de urgencia
- Atención clínica con diagnóstico, tratamiento y seguimiento
- Administración de veterinarios con gestión de horarios y estado activo/inactivo

## Instalación

```bash
npm install
```

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_URL_API` | URL base del backend (producción) | `http://localhost:8080` |


## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm dev` | Inicia servidor de desarrollo con HMR ||

## Estructura del proyecto

```text
IonicApp/
├── android/              # Proyecto nativo Android generado con Capacitor
├── cypress/              # Pruebas end-to-end
├── public/               # Archivos públicos estáticos
├── src/                  # Código fuente principal
│   ├── api/              # Peticiones HTTP hacia el backend
│   ├── auth/             # Manejo de sesión y autenticación
│   ├── components/       # Componentes reutilizables
│   │   ├── AppHeader/    # Header principal de la aplicación
│   │   └── ExploreContainer/
│   ├── config/           # Configuración global, por ejemplo base URL API
│   ├── contracts/        # Contratos e interfaces de datos
│   ├── layouts/          # Layouts generales como tabs o contenedores
│   ├── navigation/       # Configuración de navegación y tabs por rol
│   ├── pages/            # Pantallas principales de la app
│   │   ├── appointments/       # Módulo de citas
│   │   ├── clinicalAttention/  # Módulo de atención clínica
│   │   ├── home/               # Dashboard principal
│   │   ├── login/              # Inicio de sesión
│   │   ├── owners/             # Gestión de dueños
│   │   ├── pets/               # Gestión de mascotas
│   │   ├── register/           # Registro
│   │   ├── shared/             # Componentes compartidos entre páginas
│   │   ├── triage/             # Módulo de triaje
│   │   ├── users/              # Gestión de usuarios
│   │   ├── VetServices/        # Servicios veterinarios
│   │   └── waitingRoom/        # Sala de espera
│   ├── routes/           # Rutas protegidas y control de acceso
│   ├── services/         # Lógica de negocio del frontend
│   ├── theme/            # Variables y estilos globales
│   ├── types/            # Tipos auxiliares
│   └── utils/            # Utilidades generales
├── .vscode/              # Configuración del editor
└── .agents/              # Documentación y apoyo interno del proyecto
