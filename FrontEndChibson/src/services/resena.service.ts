import { apiClient } from './api';

// PENDIENTE: recién creada, no es pública · APROBADA: visible en la tienda
// RECHAZADA: no se publica · OCULTA: estaba aprobada y se retiró
export type EstadoResena = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'OCULTA';

export interface Resena {
  idResena: number;
  rutCliente: string;
  nombreCliente: string;
  calificacion: number;
  titulo: string;
  comentario: string | null;
  estado: EstadoResena;
  respuestaAdmin: string | null;
  fecha: string;
  fechaRespuesta: string | null;
  sku: string;
  modeloProducto: string;
}

const resource = '/resenas';

// Endpoints de administración (permiso GESTIONAR_RESENAS)
export const ResenaService = {
  async listar(): Promise<Resena[]> {
    const { data } = await apiClient.get<Resena[]>(`${resource}/admin`);
    return Array.isArray(data) ? data : [];
  },

  // Solo para reseñas PENDIENTES: APROBADA o RECHAZADA
  async moderar(id: number, estado: 'APROBADA' | 'RECHAZADA'): Promise<Resena> {
    const { data } = await apiClient.patch<Resena>(`${resource}/${id}/moderar`, { estado });
    return data;
  },

  // Solo para reseñas APROBADAS
  async ocultar(id: number): Promise<Resena> {
    const { data } = await apiClient.patch<Resena>(`${resource}/${id}/ocultar`);
    return data;
  },

  // Respuesta pública; si ya había una, se reemplaza
  async responder(id: number, respuesta: string): Promise<Resena> {
    const { data } = await apiClient.put<Resena>(`${resource}/${id}/respuesta`, { respuesta });
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await apiClient.delete(`${resource}/${id}`);
  }
};

export default ResenaService;
