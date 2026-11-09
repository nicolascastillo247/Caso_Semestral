import { useState } from 'react';
import { Check, HandCoins, Paperclip, X } from 'lucide-react';

import DevolucionService, { type Devolucion } from '../../services/devolucion.service';
import { estiloCampo, fechaHora, pesos } from '../../utils/formato';
import { mensajeError } from '../../utils/errores';
import { EstadoDevolucionBadge, NOMBRE_MOTIVO } from './EstadosPedido';

import { Button } from '../../components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';

// Monto a devolver: unidades devueltas por el precio que pagó el cliente (igual que el backend)
export const montoDevolucion = (d: Devolucion) => d.montoReembolsado ?? d.items.reduce((s, i) => s + i.subtotal, 0);

// ---------- Contenido ----------

interface ContenidoProps {
  devolucion: Devolucion;
  nombreUsuario: (rut: string) => string;
  onCambio: () => Promise<void>;
  onCerrar: () => void;
}

const ContenidoDevolucion = ({ devolucion: d, nombreUsuario, onCambio, onCerrar }: ContenidoProps) => {
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const ejecutar = async (accion: () => Promise<unknown>, textoError: string) => {
    setGuardando(true);
    setError('');
    try {
      await accion();
      await onCambio();
      setRechazando(false);
    } catch (err) {
      setError(mensajeError(err, textoError));
    } finally {
      setGuardando(false);
    }
  };

  const rechazar = () => {
    if (motivo.trim() === '') {
      setError('Debes indicar el motivo del rechazo.');
      return;
    }
    void ejecutar(() => DevolucionService.rechazar(d.numeroSeguimiento, motivo.trim()), 'No se pudo rechazar la devolución.');
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Devolución #{d.numeroSeguimiento} <EstadoDevolucionBadge estado={d.estado} />
        </DialogTitle>
        <DialogDescription>
          Pedido #{String(d.numeroPedido).padStart(4, '0')} · solicitada el {fechaHora(d.fechaSolicitud)}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <p><strong>Cliente:</strong> {nombreUsuario(d.rutCliente)}</p>
          <p><strong>RUT:</strong> {d.rutCliente}</p>
          <p className="sm:col-span-2"><strong>Motivo:</strong> {NOMBRE_MOTIVO[d.motivo]}</p>
        </div>

        {(d.descripcion || d.evidenciaUrl) && (
          <div className="space-y-2 rounded-lg bg-zinc-100 p-3 text-sm">
            {d.descripcion && <p className="whitespace-pre-line">{d.descripcion}</p>}
            {d.evidenciaUrl && (
              <a href={d.evidenciaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:underline">
                <Paperclip className="size-4" /> Ver evidencia
              </a>
            )}
          </div>
        )}

        {/* Productos devueltos */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Unidades</TableHead>
              <TableHead className="text-right">Precio pagado</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {d.items.map((i) => (
              <TableRow key={i.idItemDevolucion}>
                <TableCell>{i.sku}</TableCell>
                <TableCell>{i.nombreProducto}</TableCell>
                <TableCell className="text-right">{i.cantidad}</TableCell>
                <TableCell className="text-right">{pesos(i.precioUnitario)}</TableCell>
                <TableCell className="text-right">{pesos(i.subtotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-right font-bold">
                {d.estado === 'REEMBOLSADA' ? 'Reembolsado' : 'A reembolsar'}
              </TableCell>
              <TableCell className="text-right font-bold">{pesos(montoDevolucion(d))}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Resolución */}
        {(d.fechaResolucion || d.fechaReembolso) && (
          <div className="space-y-1 text-sm">
            {d.fechaResolucion && d.rutAdministrador && (
              <p>
                <strong>{d.estado === 'RECHAZADA' ? 'Rechazada' : 'Aprobada'}:</strong> {fechaHora(d.fechaResolucion)} por{' '}
                {nombreUsuario(d.rutAdministrador)}
              </p>
            )}
            {d.motivoRechazo && <p><strong>Motivo del rechazo:</strong> {d.motivoRechazo}</p>}
            {d.fechaReembolso && d.rutAdministradorReembolso && (
              <p>
                <strong>Reembolsada:</strong> {fechaHora(d.fechaReembolso)} por {nombreUsuario(d.rutAdministradorReembolso)}
              </p>
            )}
          </div>
        )}

        {/* Acciones según el estado */}
        {d.estado === 'PENDIENTE' && (
          <div className="space-y-3 border-t pt-4">
            {!rechazando && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  disabled={guardando}
                  onClick={() => void ejecutar(() => DevolucionService.aprobar(d.numeroSeguimiento), 'No se pudo aprobar la devolución.')}
                >
                  <Check /> Aprobar
                </Button>
                <Button variant="outline" disabled={guardando} onClick={() => setRechazando(true)}>
                  <X /> Rechazar
                </Button>
                <span className="text-xs text-muted-foreground">Al aprobar, los productos vuelven al stock.</span>
              </div>
            )}
            {rechazando && (
              <div className="space-y-2 rounded-lg border p-3">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Motivo del rechazo (se le avisa al cliente)
                  <textarea
                    rows={3}
                    className={`${estiloCampo} h-auto py-2 font-normal`}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" disabled={guardando} onClick={() => setRechazando(false)}>Volver</Button>
                  <Button variant="destructive" size="sm" disabled={guardando} onClick={rechazar}>Confirmar rechazo</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {d.estado === 'APROBADA' && (
          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            <Button
              disabled={guardando}
              onClick={() => void ejecutar(() => DevolucionService.reembolsar(d.numeroSeguimiento), 'No se pudo registrar el reembolso.')}
            >
              <HandCoins /> Marcar como reembolsada ({pesos(montoDevolucion(d))})
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* Las devoluciones no se eliminan: quedan como respaldo del reembolso */}
      <DialogFooter>
        <Button variant="outline" onClick={onCerrar}>Cerrar</Button>
      </DialogFooter>
    </>
  );
};

// ---------- Modal ----------

interface DevolucionDialogProps {
  devolucion: Devolucion | null;
  nombreUsuario: (rut: string) => string;
  onCerrar: () => void;
  onCambio: () => Promise<void>;
}

// Modal "Gestionar devolución": aprobar, rechazar y reembolsar
export const DevolucionDialog = ({ devolucion, nombreUsuario, onCerrar, onCambio }: DevolucionDialogProps) => (
  <Dialog open={devolucion !== null} onOpenChange={(abierto: boolean) => { if (!abierto) onCerrar(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
      {devolucion && (
        <ContenidoDevolucion
          key={devolucion.numeroSeguimiento}
          devolucion={devolucion}
          nombreUsuario={nombreUsuario}
          onCambio={onCambio}
          onCerrar={onCerrar}
        />
      )}
    </DialogContent>
  </Dialog>
);

export default DevolucionDialog;
