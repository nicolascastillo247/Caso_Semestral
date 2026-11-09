import type { EstadoPedido } from '../../services/venta.service';
import type { DireccionPedido } from '../../services/pedido.service';
import type { EstadoDevolucion, MotivoDevolucion } from '../../services/devolucion.service';
import { textoEnum } from '../../utils/formato';

import { Badge } from '../../components/ui/badge';

// Badges, textos y flujo de estados que comparten las pestañas de Pedidos y Devoluciones

export const ESTADOS_PEDIDO: EstadoPedido[] = ['PENDIENTE', 'PAGADO', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

const COLOR_PEDIDO: Record<EstadoPedido, string> = {
  PENDIENTE: 'border-transparent bg-zinc-200 text-zinc-700',
  PAGADO: 'border-transparent bg-amber-100 text-amber-800',
  EN_PROCESO: 'border-transparent bg-blue-100 text-blue-800',
  ENVIADO: 'border-transparent bg-indigo-100 text-indigo-800',
  ENTREGADO: 'border-transparent bg-green-100 text-green-800',
  CANCELADO: 'border-transparent bg-red-100 text-red-800',
};

export const EstadoPedidoBadge = ({ estado }: { estado: EstadoPedido }) => (
  <Badge variant="outline" className={COLOR_PEDIDO[estado]}>{textoEnum(estado)}</Badge>
);

// Flujo del backend: PAGADO → EN_PROCESO → ENVIADO → ENTREGADO (un paso a la vez)
export const SIGUIENTE_ESTADO: Partial<Record<EstadoPedido, EstadoPedido>> = {
  PAGADO: 'EN_PROCESO',
  EN_PROCESO: 'ENVIADO',
  ENVIADO: 'ENTREGADO',
};

export const ESTADOS_DEVOLUCION: EstadoDevolucion[] = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'REEMBOLSADA'];

const COLOR_DEVOLUCION: Record<EstadoDevolucion, string> = {
  PENDIENTE: 'border-transparent bg-amber-100 text-amber-800',
  APROBADA: 'border-transparent bg-blue-100 text-blue-800',
  RECHAZADA: 'border-transparent bg-red-100 text-red-800',
  REEMBOLSADA: 'border-transparent bg-green-100 text-green-800',
};

export const EstadoDevolucionBadge = ({ estado }: { estado: EstadoDevolucion }) => (
  <Badge variant="outline" className={COLOR_DEVOLUCION[estado]}>{textoEnum(estado)}</Badge>
);

export const NOMBRE_MOTIVO: Record<MotivoDevolucion, string> = {
  PRODUCTO_DANADO: 'Producto dañado',
  PRODUCTO_DEFECTUOSO: 'Producto defectuoso',
  PRODUCTO_INCORRECTO: 'Producto incorrecto',
  OTRO: 'Otro',
};

// "Los Aromos 123, Concepción, Biobío"
export const textoDireccion = (d: DireccionPedido | null) => {
  if (!d) return 'Sin dirección';
  const calle = [d.condominio, d.numero].filter((p) => p).join(' ');
  return [calle, d.ciudadComuna, d.region].filter((p) => p).join(', ') || 'Sin dirección';
};

// Para la tabla: "Concepción, Biobío"
export const textoDestino = (d: DireccionPedido | null) =>
  d ? [d.ciudadComuna, d.region].filter((p) => p).join(', ') || '—' : '—';
