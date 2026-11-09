import axios from 'axios';

// Temporal: RUT del administrador fijo hasta que exista el login.
// Se exporta para que la página de Usuarios no deje desactivarse ni eliminarse a uno mismo.
export const RUT_SESION = '12345678-5';

// Cliente axios compartido por todos los servicios.
// Todas las llamadas van al API Gateway (8088), que las reparte a cada microservicio.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8088/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Rut-Usuario': RUT_SESION
  }
});
