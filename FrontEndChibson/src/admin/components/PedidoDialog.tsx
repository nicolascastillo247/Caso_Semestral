import { useState } from 'react';
import { ArrowRight, Ban, Trash2 } from 'lucide-react';

import PedidoService, { type Pedido } from '../../services/pedido.service';
import { estiloCampo, fechaHora, pesos, textoEnum } from '../../utils/formato';
import { mensajeError } from '../../utils/errores';
import { EstadoPedidoBadge, SIGUIENTE_ESTADO, textoDireccion } from './EstadosPedido';

import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';

const numeroPedido = (n: number) => String(n).padStart(4, '0');

// ---------- Contenido ----------
// Componente aparte con key={numeroPedido}: el formulario de cancelación se reinicia al abrir otro pedido.

interface ContenidoProps {
  pedido: Pedido;
  nombreUsuario: (rut: string) => string;
  onCambio: () => Promise<void>;
  onEliminado: () => void;
  onCerrar: () => void;
}

const ContenidoPedido = ({ pedido, nombreUsuario, onCambio, onEliminado, onCerrar }: ContenidoProps) => {
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const siguiente = SIGUIENTE_ESTADO[pedido.estado];
  const sePuedeCancelar = pedido.estado !== 'ENTREGADO' && pedido.estado !== 'CANCELADO';
  // Mismo criterio del backend: solo se eliminan pedidos sin pago aprobado ("no facturados")
  const facturado = pedido.estado === 'ENTREGADO' || pedido.pagos.some((p) => p.estado === 'APROBADO');

  const ejecutar = async (accion: () => Promise<unknown>, textoError: string) => {
    setGuardando(true);
    setError('');
    try {
      await accion();
      await onCambio();
      setCancelando(false);
      setMotivo('');
    } catch (err) {
      setError(mensajeError(err, textoError));
    } finally {
      setGuardando(false);
    }
  };

  const cancelar = () => {
    if (motivo.trim() === '') {
      setError('Debes indicar el motivo de la cancelación.');
      return;
    }
    void ejecutar(() => PedidoService.cancelar(pedido.numeroPedido, motivo.trim()), 'No se pudo cancelar el pedido.');
  };

  const eliminar = async () => {
    setGuardando(true);
    setError('');
    try {
      await PedidoService.eliminar(pedido.numeroPedido);
      onEliminado();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar el pedido.'));
      setConfirmandoEliminar(false);
      setGuardando(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Pedido #{numeroPedido(pedido.numeroPedido)} <EstadoPedidoBadge estado={pedido.estado} />
        </DialogTitle>
        <DialogDescription>Realizado el {fechaHora(pedido.fecha)}</DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        {/* Datos del cliente y del envío */}
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <p><strong>Cliente:</strong> {pedido.nombreCliente ?? pedido.rutCliente}</p>
          <p><strong>RUT:</strong> {pedido.rutCliente}</p>
          <p><strong>Método de pago:</strong> {pedido.metodoPago ? textoEnum(pedido.metodoPago) : 'Sin pago'}</p>
          <p className="sm:col-span-2">
            <strong>Dirección de envío:</strong> {textoDireccion(pedido.direccion)}
            {pedido.direccion?.alternativa && <Badge variant="outline" className="ml-2">Dirección alternativa</Badge>}
          </p>
        </div>

        {pedido.motivoCancelacion && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <strong>Motivo de cancelación:</strong> {pedido.motivoCancelacion}
          </p>
        )}

        {/* Productos */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedido.items.map((item) => (
              <TableRow key={item.idItem}>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.nombreProducto}</TableCell>
                <TableCell className="text-right">{item.cantidad}</TableCell>
                <TableCell className="text-right">{pesos(item.precioUnitario)}</TableCell>
                <TableCell className="text-right">{pesos(item.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-right">Subtotal</TableCell>
              <TableCell className="text-right">{pesos(pedido.subtotal)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} className="text-right">Envío</TableCell>
              <TableCell className="text-right">{pedido.costoEnvio === 0 ? 'Gratis' : pesos(pedido.costoEnvio)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
              <TableCell className="text-right font-bold">{pesos(pedido.total)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} className="text-right text-xs text-muted-foreground">IVA incluido en los precios (19%)</TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">{pesos(pedido.iva)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Historial de estados (HU-36) */}
        <div className="space-y-2">
          <h3 className="font-semibold">Historial de estados</h3>
          <ol className="space-y-2 border-l pl-4 text-sm">
            {pedido.historial.map((h) => (
              <li key={h.idHistorial}>
                <span className="font-medium">
                  {h.estadoAnterior ? `${textoEnum(h.estadoAnterior)} → ${textoEnum(h.estadoNuevo)}` : `Creado como ${textoEnum(h.estadoNuevo).toLowerCase()}`}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {fechaHora(h.fecha)} · {h.rutResponsable === pedido.rutCliente ? 'Cliente' : nombreUsuario(h.rutResponsable)}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Intentos de pago */}
        {pedido.pagos.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Pagos</h3>
            <ul className="space-y-1 text-sm">
              {pedido.pagos.map((p) => (
                <li key={p.idPago} className="flex flex-wrap justify-between gap-2">
                  <span>
                    {fechaHora(p.fecha)} · {textoEnum(p.metodo)}
                    {p.motivoRechazo && <span className="text-muted-foreground"> — {p.motivoRechazo}</span>}
                  </span>
                  <span className={p.estado === 'APROBADO' ? 'text-green-700' : 'text-red-600'}>
                    {pesos(p.monto)} · {textoEnum(p.estado)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Acciones sobre el estado */}
        {(siguiente || sePuedeCancelar) && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {siguiente && (
                <Button
                  disabled={guardando}
                  onClick={() => void ejecutar(() => PedidoService.actualizarEstado(pedido.numeroPedido, siguiente), 'No se pudo actualizar el estado.')}
                >
                  <ArrowRight /> Pasar a {textoEnum(siguiente).toLowerCase()}
                </Button>
              )}
              {pedido.estado === 'PENDIENTE' && (
                <span className="text-sm text-muted-foreground">Esperando el pago del cliente.</span>
              )}
              {sePuedeCancelar && !cancelando && (
                <Button variant="outline" disabled={guardando} onClick={() => setCancelando(true)}>
                  <Ban /> Cancelar pedido
                </Button>
              )}
            </div>

            {cancelando && (
              <div className="space-y-2 rounded-lg border p-3">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Motivo de la cancelación (se le avisa al cliente)
                  <textarea
                    rows={3}
                    className={`${estiloCampo} h-auto py-2 font-normal`}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                  />
                </label>
                {facturado && (
                  <p className="text-xs text-muted-foreground">El pedido ya está pagado: al cancelarlo se repone el stock.</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" disabled={guardando} onClick={() => setCancelando(false)}>Volver</Button>
                  <Button variant="destructive" size="sm" disabled={guardando} onClick={cancelar}>Confirmar cancelación</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Eliminar: solo pedidos no facturados. Los pagados se cancelan. */}
        <div>
          {confirmandoEliminar ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm">¿Eliminar el pedido?</span>
              <Button variant="destructive" size="sm" onClick={() => void eliminar()} disabled={guardando}>Sí, eliminar</Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmandoEliminar(false)} disabled={guardando}>Cancelar</Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setConfirmandoEliminar(true)}
              disabled={guardando || facturado}
              title={facturado ? 'Un pedido pagado no se puede eliminar; usa Cancelar pedido' : undefined}
            >
              <Trash2 /> Eliminar
            </Button>
          )}
        </div>
        <Button variant="outline" onClick={onCerrar}>Cerrar</Button>
      </DialogFooter>
    </>
  );
};

// ---------- Modal ----------

interface PedidoDialogProps {
  pedido: Pedido | null;
  nombreUsuario: (rut: string) => string;
  onCerrar: () => void;
  onCambio: () => Promise<void>;
  onEliminado: () => void;
}

// Modal "Gestionar pedido": detalle, avanzar estado, cancelar y eliminar
export const PedidoDialog = ({ pedido, nombreUsuario, onCerrar, onCambio, onEliminado }: PedidoDialogProps) => (
  <Dialog open={pedido !== null} onOpenChange={(abierto: boolean) => { if (!abierto) onCerrar(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
      {pedido && (
        <ContenidoPedido
          key={pedido.numeroPedido}
          pedido={pedido}
          nombreUsuario={nombreUsuario}
          onCambio={onCambio}
          onEliminado={onEliminado}
          onCerrar={onCerrar}
        />
      )}
    </DialogContent>
  </Dialog>
);

export default PedidoDialog;
