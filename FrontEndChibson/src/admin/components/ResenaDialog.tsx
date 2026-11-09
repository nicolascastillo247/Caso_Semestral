import { useState } from 'react';
import { Check, EyeOff, Send, Trash2, X } from 'lucide-react';

import ResenaService, { type EstadoResena, type Resena } from '../../services/resena.service';
import { estiloCampo, fechaHora, textoEnum } from '../../utils/formato';
import { mensajeError } from '../../utils/errores';
import { Estrellas } from './Estrellas';

import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';

export const ESTADOS_RESENA: EstadoResena[] = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'OCULTA'];

const COLOR_ESTADO: Record<EstadoResena, string> = {
  PENDIENTE: 'border-transparent bg-amber-100 text-amber-800',
  APROBADA: 'border-transparent bg-green-100 text-green-800',
  RECHAZADA: 'border-transparent bg-red-100 text-red-800',
  OCULTA: 'border-transparent bg-zinc-200 text-zinc-700',
};

export const EstadoResenaBadge = ({ estado }: { estado: EstadoResena }) => (
  <Badge variant="outline" className={COLOR_ESTADO[estado]}>{textoEnum(estado)}</Badge>
);

// ---------- Contenido del modal ----------
// Va en un componente aparte con key={idResena}: así el formulario se reinicia al abrir otra reseña.

interface ContenidoProps {
  resena: Resena;
  onCambio: () => Promise<void>;
  onEliminada: () => void;
  onCerrar: () => void;
}

const ContenidoResena = ({ resena, onCambio, onEliminada, onCerrar }: ContenidoProps) => {
  const [respuesta, setRespuesta] = useState(resena.respuestaAdmin ?? '');
  const [guardando, setGuardando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState('');

  // Ejecuta una acción contra el backend y recarga la tabla (el modal se actualiza con ella)
  const ejecutar = async (accion: () => Promise<unknown>, textoError: string) => {
    setGuardando(true);
    setError('');
    try {
      await accion();
      await onCambio();
    } catch (err) {
      setError(mensajeError(err, textoError));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    setGuardando(true);
    setError('');
    try {
      await ResenaService.eliminar(resena.idResena);
      onEliminada();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar la reseña.'));
      setGuardando(false);
    }
  };

  const respuestaCambio = respuesta.trim() !== '' && respuesta.trim() !== (resena.respuestaAdmin ?? '');

  return (
    <>
      <DialogHeader>
        <DialogTitle>Reseña de {resena.modeloProducto}</DialogTitle>
        <DialogDescription>SKU {resena.sku}</DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        {/* Datos */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <p><strong>Cliente:</strong> {resena.nombreCliente}</p>
          <p><strong>RUT:</strong> {resena.rutCliente}</p>
          <p><strong>Fecha:</strong> {fechaHora(resena.fecha)}</p>
          <p><strong>Estado:</strong> <EstadoResenaBadge estado={resena.estado} /></p>
        </div>

        {/* Reseña */}
        <div className="space-y-2 rounded-lg border p-4">
          <Estrellas valor={resena.calificacion} tamano="size-5" />
          <p className="font-semibold">{resena.titulo}</p>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {resena.comentario || 'El cliente no dejó comentario.'}
          </p>
        </div>

        {/* Moderación: depende del estado */}
        <div className="space-y-2">
          <h3 className="font-semibold">Moderación</h3>
          {resena.estado === 'PENDIENTE' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Esta reseña todavía no es pública.</span>
              <Button
                size="sm"
                disabled={guardando}
                onClick={() => void ejecutar(() => ResenaService.moderar(resena.idResena, 'APROBADA'), 'No se pudo aprobar la reseña.')}
              >
                <Check /> Aprobar
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={guardando}
                onClick={() => void ejecutar(() => ResenaService.moderar(resena.idResena, 'RECHAZADA'), 'No se pudo rechazar la reseña.')}
              >
                <X /> Rechazar
              </Button>
            </div>
          )}
          {resena.estado === 'APROBADA' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Visible en la ficha del producto.</span>
              <Button
                size="sm"
                variant="outline"
                disabled={guardando}
                onClick={() => void ejecutar(() => ResenaService.ocultar(resena.idResena), 'No se pudo ocultar la reseña.')}
              >
                <EyeOff /> Ocultar
              </Button>
            </div>
          )}
          {resena.estado === 'RECHAZADA' && (
            <p className="text-sm text-muted-foreground">Fue rechazada y no se publica.</p>
          )}
          {resena.estado === 'OCULTA' && (
            <p className="text-sm text-muted-foreground">Fue retirada de la vista pública.</p>
          )}
        </div>

        {/* Respuesta pública de la tienda (una por reseña; si ya existe, se reemplaza) */}
        <div className="space-y-2">
          <h3 className="font-semibold">Respuesta de la tienda</h3>
          {resena.respuestaAdmin && resena.fechaRespuesta && (
            <p className="text-xs text-muted-foreground">Última respuesta: {fechaHora(resena.fechaRespuesta)}</p>
          )}
          <textarea
            rows={4}
            className={`${estiloCampo} h-auto w-full py-2`}
            placeholder="Escribe una respuesta pública..."
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={guardando || !respuestaCambio}
              onClick={() => void ejecutar(() => ResenaService.responder(resena.idResena, respuesta.trim()), 'No se pudo guardar la respuesta.')}
            >
              <Send /> {resena.respuestaAdmin ? 'Actualizar respuesta' : 'Publicar respuesta'}
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {confirmando ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">¿Eliminar la reseña definitivamente?</span>
            <Button variant="destructive" size="sm" onClick={() => void eliminar()} disabled={guardando}>
              {guardando ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmando(false)} disabled={guardando}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button variant="destructive" onClick={() => setConfirmando(true)}>
            <Trash2 /> Eliminar
          </Button>
        )}
        <Button variant="outline" onClick={onCerrar}>Cerrar</Button>
      </DialogFooter>
    </>
  );
};

// ---------- Modal ----------

interface ResenaDialogProps {
  // Reseña a gestionar; null = modal cerrado
  resena: Resena | null;
  onCerrar: () => void;
  onCambio: () => Promise<void>;
  onEliminada: () => void;
}

// Modal "Gestionar reseña": moderar, ocultar, responder y eliminar.
export const ResenaDialog = ({ resena, onCerrar, onCambio, onEliminada }: ResenaDialogProps) => (
  <Dialog open={resena !== null} onOpenChange={(abierto: boolean) => { if (!abierto) onCerrar(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      {resena && (
        <ContenidoResena
          key={resena.idResena}
          resena={resena}
          onCambio={onCambio}
          onEliminada={onEliminada}
          onCerrar={onCerrar}
        />
      )}
    </DialogContent>
  </Dialog>
);

export default ResenaDialog;
