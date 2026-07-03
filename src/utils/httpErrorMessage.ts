import axios from "axios";

export function getHttpErrorMessage(
  error: unknown,
  fallbackMessage: string,
  invalidCredentialsMessage?: string,
) {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const status = error.response?.status;
  const serverMessage =
    typeof error.response?.data === "string"
      ? error.response.data
      : (error.response?.data as { message?: string } | undefined)?.message;

  if (status === 400 || status === 401) {
    return invalidCredentialsMessage ?? serverMessage ?? fallbackMessage;
  }

  if (status === 409) {
    return serverMessage ?? "El registro ya existe o entra en conflicto.";
  }

  if (status === 422) {
    return serverMessage ?? "Los datos enviados no son válidos.";
  }

  if (!error.response) {
    return "No se pudo conectar con el servidor. Verifica la red o la URL del backend.";
  }

  if (status && status >= 500) {
    return "El backend respondió con un error interno.";
  }

  return serverMessage ?? fallbackMessage;
}
