import { useState, type FormEvent } from 'react';
import { Paperclip, Send, Star, Trash2 } from 'lucide-react';

import useTicket from '../../hooks/useTicket';
import TicketService, { type EstadoTicket, type Ticket } from '../../services/ticket.service';
import { estiloCampo, fechaHora, textoEnum } from '../../utils/formato';
import { mensajeError } from '../../utils/errores';

import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';

export const ESTADOS_TICKET: EstadoTicket[] = ['ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];

// Colores por estado (se usan también en la tabla)
const COLOR_ESTADO: Record<EstadoTicket, string> = {
  ABIERTO: 'border-transparent bg-amber-100 text-amber-800',
  EN_PROCESO: 'border-transparent bg-blue-100 text-blue-800',
  RESUELTO: 'border-transparent bg-green-100 text-green-800',
  CERRADO: 'border-transparent bg-zinc-200 text-zinc-700',
};

export const EstadoBadge = ({ estado }: { estado: EstadoTicket }) => (
  <Badge variant="outline" className={COLOR_ESTADO[estado]}>{textoEnum(estado)}</Badge>
);

// "Cerrado" es final: después ya no se puede responder ni cambiar el estado
const textoOpcionEstado = (e: EstadoTicket) => (e === 'CERRADO' ? 'Cerrado (no se puede reabrir)' : textoEnum(e));

interface TicketDialogProps {
  // Ticket a gestionar; null = modal cerrado
  numero: number | null;
  nombreAdmin: (rut: string) => string;
  onCerrar: () => void;
  // Se llama al responder o cambiar estado, para refrescar la tabla
  onActualizado: (ticket: Ticket) => void;
  onEliminado: () => void;
}

// Modal "Gestionar ticket": conversación, responder, cambiar estado y eliminar.
export const TicketDialog = ({ numero, nombreAdmin, onCerrar, onActualizado, onEliminado }: TicketDialogProps) => {
  const { ticket, setTicket, loading, error } = useTicket(numero);

  const [respuesta, setRespuesta] = useState('');
  const [estadoConRespuesta, setEstadoConRespuesta] = useState<EstadoTicket | ''>('');
  const [nuevoEstado, setNuevoEstado] = useState<EstadoTicket | ''>('');
  const [guardando, setGuardando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cerrado = ticket?.estado === 'CERRADO';
  const otrosEstados = ESTADOS_TICKET.filter((e) => e !== ticket?.estado);

  const limpiar = () => {
    setRespuesta('');
    setEstadoConRespuesta('');
    setNuevoEstado('');
    setConfirmando(false);
    setMensaje('');
  };

  const cerrar = () => {
    limpiar();
    onCerrar();
  };

  // Después de cada cambio: el modal muestra el ticket actualizado y la tabla se refresca
  const aplicar = (actualizado: Ticket) => {
    setTicket(actualizado);
    onActualizado(actualizado);
  };

  const enviarRespuesta = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (numero === null) return;
    if (respuesta.trim() === '') {
      setMensaje('La respuesta no puede estar vacía.');
      return;
    }
    setGuardando(true);
    setMensaje('');
    try {
      aplicar(await TicketService.responder(numero, respuesta.trim(), estadoConRespuesta || undefined));
      setRespuesta('');
      setEstadoConRespuesta('');
    } catch (err) {
      setMensaje(mensajeError(err, 'No se pudo enviar la respuesta.'));
    } finally {
      setGuardando(false);
    }
  };

  const guardarEstado = async () => {
    if (numero === null || nuevoEstado === '') return;
    setGuardando(true);
    setMensaje('');
    try {
      aplicar(await TicketService.actualizarEstado(numero, nuevoEstado));
      setNuevoEstado('');
    } catch (err) {
      setMensaje(mensajeError(err, 'No se pudo cambiar el estado.'));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (numero === null) return;
    setGuardando(true);
    setMensaje('');
    try {
      await TicketService.eliminar(numero);
      limpiar();
      onEliminado();
    } catch (err) {
      setMensaje(mensajeError(err, 'No se pudo eliminar el ticket.'));
    } finally {
      setGuardando(false);
    }
  };

  const nombreCliente = ticket ? ticket.nombreCliente ?? ticket.rutCliente : '';

  return (
    <Dialog open={numero !== null} onOpenChange={(abierto: boolean) => { if (!abierto) cerrar(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ticket #{numero !== null && String(numero).padStart(4, '0')}</DialogTitle>
          <DialogDescription>{ticket ? ticket.asunto : 'Cargando...'}</DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Cargando ticket...</p>}
        {error && <p className="text-sm text-red-600">No se pudo cargar el ticket.</p>}

        {ticket && (
          <div className="space-y-5">
            {/* Datos */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p><strong>Cliente:</strong> {nombreCliente}</p>
              <p><strong>RUT:</strong> {ticket.rutCliente}</p>
              <p><strong>Categoría:</strong> {textoEnum(ticket.categoria)}</p>
              <p><strong>Estado:</strong> <EstadoBadge estado={ticket.estado} /></p>
              <p><strong>Creado:</strong> {fechaHora(ticket.fechaCreacion)}</p>
              {ticket.fechaResolucion && <p><strong>Resuelto:</strong> {fechaHora(ticket.fechaResolucion)}</p>}
            </div>

            {/* Calificación que dejó el cliente al cerrar */}
            {ticket.calificacion !== null && (
              <div className="rounded-lg border p-3 text-sm">
                <p className="flex items-center gap-1">
                  <strong className="mr-1">Calificación del cliente:</strong>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < (ticket.calificacion ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`}
                    />
                  ))}
                </p>
                {ticket.comentarioCalificacion && <p className="mt-1 text-muted-foreground">"{ticket.comentarioCalificacion}"</p>}
              </div>
            )}

            {/* Conversación: el mensaje del cliente y luego las respuestas */}
            <div className="space-y-3">
              <h3 className="font-semibold">Conversación</h3>
              <div className="max-w-[85%] rounded-lg bg-zinc-100 p-3 text-sm">
                <p className="mb-1 text-xs text-muted-foreground">{nombreCliente} · {fechaHora(ticket.fechaCreacion)}</p>
                <p className="whitespace-pre-line">{ticket.descripcion}</p>
                {ticket.adjuntoUrl && (
                  <a
                    href={ticket.adjuntoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-blue-700 hover:underline"
                  >
                    <Paperclip className="size-4" /> Ver adjunto
                  </a>
                )}
              </div>
              {ticket.mensajes.map((m) => (
                <div
                  key={m.idMensaje}
                  className={`max-w-[85%] rounded-lg p-3 text-sm ${m.esAdministrador ? 'ml-auto bg-zinc-800 text-white' : 'bg-zinc-100'}`}
                >
                  <p className={`mb-1 text-xs ${m.esAdministrador ? 'text-zinc-300' : 'text-muted-foreground'}`}>
                    {m.esAdministrador ? `Soporte (${nombreAdmin(m.rutAutor)})` : nombreCliente} · {fechaHora(m.fecha)}
                  </p>
                  <p className="whitespace-pre-line">{m.contenido}</p>
                </div>
              ))}
              {ticket.mensajes.length === 0 && (
                <p className="text-sm text-muted-foreground">Todavía no hay respuestas.</p>
              )}
            </div>

            {cerrado ? (
              <p className="rounded-lg border bg-muted p-3 text-sm">
                Este ticket está cerrado: ya no se puede responder ni cambiar su estado.
              </p>
            ) : (
              <>
                {/* Responder (opcionalmente cambiando el estado) */}
                <form className="space-y-2" onSubmit={(e) => void enviarRespuesta(e)}>
                  <label className="flex flex-col gap-1 text-sm font-semibold">
                    Responder
                    <textarea
                      rows={4}
                      className={`${estiloCampo} h-auto py-2 font-normal`}
                      placeholder="Escribe tu respuesta..."
                      value={respuesta}
                      onChange={(e) => setRespuesta(e.target.value)}
                    />
                  </label>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      Cambiar estado a
                      <select
                        className={estiloCampo}
                        value={estadoConRespuesta}
                        onChange={(e) => setEstadoConRespuesta(e.target.value as EstadoTicket | '')}
                      >
                        <option value="">Sin cambio</option>
                        {otrosEstados.map((e) => (
                          <option key={e} value={e}>{textoOpcionEstado(e)}</option>
                        ))}
                      </select>
                    </label>
                    <Button type="submit" disabled={guardando}>
                      <Send /> {guardando ? 'Enviando...' : 'Enviar respuesta'}
                    </Button>
                  </div>
                </form>

                {/* Solo cambiar el estado */}
                <div className="flex flex-wrap items-end gap-2 border-t pt-4">
                  <label className="flex flex-col gap-1 text-sm font-semibold">
                    Actualizar estado sin responder
                    <select
                      className={`${estiloCampo} font-normal`}
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value as EstadoTicket | '')}
                    >
                      <option value="">Elegir estado...</option>
                      {otrosEstados.map((e) => (
                        <option key={e} value={e}>{textoOpcionEstado(e)}</option>
                      ))}
                    </select>
                  </label>
                  <Button variant="outline" onClick={() => void guardarEstado()} disabled={guardando || nuevoEstado === ''}>
                    Actualizar
                  </Button>
                </div>
              </>
            )}

            {mensaje && <p className="text-sm text-red-600">{mensaje}</p>}
          </div>
        )}

        <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Eliminar con confirmación en dos pasos */}
          {confirmando ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm">¿Eliminar el ticket y su conversación?</span>
              <Button variant="destructive" size="sm" onClick={() => void eliminar()} disabled={guardando}>
                {guardando ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmando(false)} disabled={guardando}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setConfirmando(true)} disabled={!ticket}>
              <Trash2 /> Eliminar
            </Button>
          )}
          <Button variant="outline" onClick={cerrar}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDialog;
