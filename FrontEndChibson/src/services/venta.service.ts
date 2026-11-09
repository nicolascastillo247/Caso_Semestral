import { apiClient } from './api';

export type MetodoPago = 'DEBITO' | 'CREDITO' | 'TRANSFERENCIA';

export type EstadoPedido = 'PENDIENTE' | 'PAGADO' | 'EN_PROCESO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';

// Una línea del pedido: qué producto, cuántas unidades y a qué precio se vendió
export interface ItemPedido {
  idItem: number;
  sku: string;
  nombreProducto: string;
  categoria: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// Un producto reembolsado de la venta (HU-59 criterio 4)
export interface Reembolso {
  fechaReembolso: string;
  sku: string;
  cantidad: number;
  monto: number;
}

// Una venta = un pedido con pago aprobado. El número de venta es el número de pedido.
export interface Venta {
  numeroVenta: number;
  rutCliente: string;
  nombreCliente: string | null;
  fecha: string;
  total: number;
  montoReembolsado: number;
  totalNeto: number;
  metodoPago: MetodoPago;
  estadoPedido: EstadoPedido;
  items: ItemPedido[];
  reembolsos: Reembolso[];
}

const resource = '/ventas';

// Registro de ventas (HU-57 a HU-59). Es de solo lectura.
export const VentaService = {
  async listar(): Promise<Venta[]> {
    const { data } = await apiClient.get<Venta[]>(resource);
    return Array.isArray(data) ? data : [];
  }
};

export default VentaService;
