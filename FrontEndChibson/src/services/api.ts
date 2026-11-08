import axios from 'axios';

// Cliente axios compartido por todos los servicios.
// Todas las llamadas van al API Gateway (8088), que las reparte a cada microservicio.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8088/api',
  headers: {
    'Content-Type': 'application/json',
    // Temporal: RUT del administrador fijo hasta que exista el login
    'X-Rut-Usuario': '12345678-5'
  }
});
