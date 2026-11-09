import { isAxiosError } from 'axios';

// Saca el mensaje que manda el backend (ResponseStatusException → { message: "..." }).
// Si no hay mensaje (por ejemplo, el microservicio está apagado), usa el texto por defecto.
export const mensajeError = (err: unknown, porDefecto: string) => {
  if (isAxiosError<{ message?: string }>(err) && err.response?.data?.message) {
    return err.response.data.message;
  }
  return porDefecto;
};
