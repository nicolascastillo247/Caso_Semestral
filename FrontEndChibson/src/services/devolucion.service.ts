import { apiClient } from './api';

export type EstadoDevolucion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'REEMBOLSADA';
export type MotivoDevolucion = 'PRODUCTO_DANADO' | 'PRODUCTO_DEFECTUOSO' | 'PRODUCTO_INCORRECTO' | 'OTRO';

export interface ItemDevolucion {
  idItemDevolucion: number;
  sku: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number; // el que pagó el cliente
  subtotal: number;
}

export interface Devolucion {
  numeroSeguimiento: number;
  numeroPedido: number;
  rutCliente: string;
  items: ItemDevolucion[];
  motivo: MotivoDevolucion;
  descripcion: string | null;
  evidenciaUrl: string | null;
  estado: EstadoDevolucion;
  motivoRechazo: string | null;
  rutAdministrador: string | null; // quién aprobó o rechazó
  fechaSolicitud: string;
  fechaResolucion: string | null;
  montoReembolsado: number | null;
  fechaReembolso: string | null;
  rutAdministradorReembolso: string | null;
}

const resource = '/devoluciones';

// Endpoints de administración (permiso GESTIONAR_PEDIDOS)
export const DevolucionService = {
  async listar(): Promise<Devolucion[]> {
    const { data } = await apiClient.get<Devolucion[]>(resource);
    return Array.isArray(data) ? data : [];
  },

  async obtener(numero: number): Promise<Devolucion> {
    const { data } = await apiClient.get<Devolucion>(`${resource}/${numero}`);
    return data;
  },

  // Solo pendientes. El backend repone el stock de los productos devueltos.
  async aprobar(numero: number): Promise<Devolucion> {
    const { data } = await apiClient.patch<Devolucion>(`${resource}/${numero}/aprobar`);
    return data;
  },

  // Solo pendientes. El motivo es obligatorio y se le avisa al cliente.
  async rechazar(numero: number, motivo: string): Promise<Devolucion> {
    const { data } = await apiClient.patch<Devolucion>(`${resource}/${numero}/rechazar`, { motivo });
    return data;
  },

  // Solo aprobadas (HU-89)
  async reembolsar(numero: number): Promise<Devolucion> {
    const { data } = await apiClient.patch<Devolucion>(`${resource}/${numero}/reembolsar`);
    return data;
  }
};

export default DevolucionService;
