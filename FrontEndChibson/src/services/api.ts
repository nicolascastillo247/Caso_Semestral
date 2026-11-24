import axios from 'axios';
import { API_BASE_URL, SESION_KEY, agregarToken } from '../tienda/api/apiClient';

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

// Antes de cada petición se agrega el JWT de la sesión (Authorization: Bearer <token>).
// El gateway lo valida y el backend revisa los permisos del usuario dueño del token.
agregarToken(apiClient);
