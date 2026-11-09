import { apiClient } from './api';
import type { EstadoPedido } from './venta.service';

// Solo los campos del pedido que usa el Dashboard (región de despacho y estado)
export interface PedidoResumen {
  numeroPedido: number;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  direccion: { region: string | null } | null;
}

// Producto con stock bajo, tal como lo entrega ms-productos
export interface ProductoStockBajo {
  sku: string;
  modelo: string;
  marca: string;
  categoria: string;
  stockDisponible: number;
  stockMinimo: number;
}

// Hoy en formato AAAA-MM-DD (el que usan los endpoints con fechas)
const hoyISO = () => new Date().toLocaleDateString('en-CA');

// Llamadas que usa el Dashboard. Las ventas se piden con VentaService.
export const DashboardService = {
  async listarPedidos(): Promise<PedidoResumen[]> {
    const { data } = await apiClient.get<PedidoResumen[]>('/pedidos');
    return Array.isArray(data) ? data : [];
  },

  async listarStockBajo(): Promise<ProductoStockBajo[]> {
    const { data } = await apiClient.get<ProductoStockBajo[]>('/productos/bajo-stock');
    return Array.isArray(data) ? data : [];
  },

  async contarTicketsAbiertos(): Promise<number> {
    const { data } = await apiClient.get<number>('/tickets/abiertos/contar');
    return data;
  },

  async contarDevolucionesPendientes(): Promise<number> {
    const { data } = await apiClient.get<number>('/devoluciones/pendientes/contar');
    return data;
  },

  async contarClientesNuevosHoy(): Promise<number> {
    const hoy = hoyISO();
    const { data } = await apiClient.get<number>('/usuarios/registrados/contar', {
      params: { desde: hoy, hasta: hoy }
    });
    return data;
  }
};

export default DashboardService;
