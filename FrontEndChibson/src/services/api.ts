import axios from 'axios';
import { API_BASE_URL, HEADER_RUT, SESION_KEY } from '../tienda/api/apiClient';

// RUT del usuario que inició sesión (la sesión la guarda el login de la tienda).
// La página de Usuarios lo usa para que nadie pueda desactivarse ni eliminarse a sí mismo.
export const rutSesion = (): string | null => {
  try {
    const guardada = localStorage.getItem(SESION_KEY);
    return guardada ? (JSON.parse(guardada) as { rut?: string }).rut ?? null : null;
  } catch {
    return null;
  }
};

// Cliente axios del panel de administración.
// Todas las llamadas van al API Gateway (8088), que las reparte a cada microservicio.
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Antes de cada petición se agrega el RUT de la sesión: el backend revisa los permisos con él
apiClient.interceptors.request.use((config) => {
  const rut = rutSesion();
  if (rut) {
    config.headers[HEADER_RUT] = rut;
  }
  return config;
});
