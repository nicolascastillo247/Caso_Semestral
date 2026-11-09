import { apiClient } from './api';
import type { EstadoPedido, ItemPedido, MetodoPago } from './venta.service';

export interface DireccionPedido {
  region: string | null;
  ciudadComuna: string | null;
  condominio: string | null;
  numero: string | null;
  alternativa: boolean; // true = dirección distinta a la del perfil, solo para este pedido
}

// Cada cambio de estado (HU-36)
export interface HistorialEstado {
  idHistorial: number;
  estadoAnterior: EstadoPedido | null; // vacío en la creación del pedido
  estadoNuevo: EstadoPedido;
  rutResponsable: string;
  fecha: string;
}

// Cada intento de pago (la pasarela es simulada)
export interface PagoPedido {
  idPago: number;
  metodo: MetodoPago;
  monto: number;
  estado: 'APROBADO' | 'RECHAZADO';
  motivoRechazo: string | null;
  fecha: string;
}

export interface Pedido {
  numeroPedido: number;
  rutCliente: string;
  nombreCliente: string | null;
  fecha: string;
  estado: EstadoPedido;
  subtotal: number;
  costoEnvio: number;
  iva: number;
  total: number;
  metodoPago: MetodoPago | null;
  direccion: DireccionPedido | null;
  motivoCancelacion: string | null;
  items: ItemPedido[];
  historial: HistorialEstado[];
  pagos: PagoPedido[];
}

const resource = '/pedidos';

// Endpoints de administración (permiso GESTIONAR_PEDIDOS)
export const PedidoService = {
  async listar(): Promise<Pedido[]> {
    const { data } = await apiClient.get<Pedido[]>(resource);
    return Array.isArray(data) ? data : [];
  },

  async obtener(numero: number): Promise<Pedido> {
    const { data } = await apiClient.get<Pedido>(`${resource}/${numero}`);
    return data;
  },

  // Solo avanza un paso: PAGADO → EN_PROCESO → ENVIADO → ENTREGADO
  async actualizarEstado(numero: number, estado: EstadoPedido): Promise<Pedido> {
    const { data } = await apiClient.patch<Pedido>(`${resource}/${numero}/estado`, { estado });
    return data;
  },

  // Si estaba pagado, el backend repone el stock
  async cancelar(numero: number, motivo: string): Promise<Pedido> {
    const { data } = await apiClient.patch<Pedido>(`${resource}/${numero}/cancelar`, { motivo });
    return data;
  },

  // Solo pedidos sin pago aprobado; los facturados se cancelan
  async eliminar(numero: number): Promise<void> {
    await apiClient.delete(`${resource}/${numero}`);
  }
};

export default PedidoService;
