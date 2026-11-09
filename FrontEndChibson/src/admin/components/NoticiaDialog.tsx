import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import NoticiaService, { type CategoriaNoticia, type EstadoNoticia, type Noticia } from '../../services/noticia.service';
import { estiloCampo, textoEnum } from '../../utils/formato';
import { mensajeError } from '../../utils/errores';

import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';

export const NOMBRE_CATEGORIA: Record<CategoriaNoticia, string> = {
  PROMOCION: 'Promoción',
  EVENTO: 'Evento',
  ANUNCIO: 'Anuncio',
};

export const ESTADOS_NOTICIA: EstadoNoticia[] = ['BORRADOR', 'ACTIVADA', 'DESACTIVADA'];

const COLOR_ESTADO: Record<EstadoNoticia, string> = {
  BORRADOR: 'border-transparent bg-amber-100 text-amber-800',
  ACTIVADA: 'border-transparent bg-green-100 text-green-800',
  DESACTIVADA: 'border-transparent bg-zinc-200 text-zinc-700',
};

export const EstadoNoticiaBadge = ({ estado }: { estado: EstadoNoticia }) => (
  <Badge variant="outline" className={COLOR_ESTADO[estado]}>{textoEnum(estado)}</Badge>
);

const MAX_TITULO = 150;

// ---------- Formulario ----------
// Se monta cada vez que se abre el modal, así empieza con los datos de la noticia (o vacío al crear).

interface FormularioProps {
  noticia: Noticia | null;
  onCerrar: () => void;
  onGuardado: () => void;
  onEliminada: () => void;
}

const FormularioNoticia = ({ noticia, onCerrar, onGuardado, onEliminada }: FormularioProps) => {
  const editando = noticia !== null;

  const [titulo, setTitulo] = useState(noticia?.titulo ?? '');
  const [categoria, setCategoria] = useState<CategoriaNoticia>(noticia?.categoria ?? 'ANUNCIO');
  const [fechaPublicacion, setFechaPublicacion] = useState(noticia?.fechaPublicacion ?? '');
  const [imagenUrl, setImagenUrl] = useState(noticia?.imagenUrl ?? '');
  const [contenido, setContenido] = useState(noticia?.contenido ?? '');
  const [imagenRota, setImagenRota] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState('');

  const guardar = async (publicar: boolean) => {
    if (titulo.trim() === '' || contenido.trim() === '') {
      setError('El título y el contenido son obligatorios.');
      return;
    }
    const datos = {
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      imagenUrl: imagenUrl.trim(),
      categoria,
      fechaPublicacion: fechaPublicacion || undefined,
    };
    setGuardando(true);
    setError('');
    try {
      if (editando) {
        await NoticiaService.actualizar(noticia.idNoticia, datos);
      } else {
        await NoticiaService.crear({ ...datos, publicar });
      }
      onGuardado();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar la noticia.'));
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!editando) return;
    setGuardando(true);
    setError('');
    try {
      await NoticiaService.eliminar(noticia.idNoticia);
      onEliminada();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo eliminar la noticia.'));
      setGuardando(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editando ? `Modificar noticia #${noticia.idNoticia}` : 'Agregar noticia'}</DialogTitle>
        <DialogDescription className="flex items-center gap-2">
          {editando ? (
            <>Estado actual: <EstadoNoticiaBadge estado={noticia.estado} /></>
          ) : (
            'Puedes publicarla de inmediato o guardarla como borrador.'
          )}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="flex justify-between">
            Título <span className="text-xs text-muted-foreground">{titulo.length}/{MAX_TITULO}</span>
          </span>
          <Input
            value={titulo}
            maxLength={MAX_TITULO}
            placeholder="Título de la noticia"
            onChange={(e) => setTitulo(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Categoría
            <select className={estiloCampo} value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaNoticia)}>
              {(Object.keys(NOMBRE_CATEGORIA) as CategoriaNoticia[]).map((c) => (
                <option key={c} value={c}>{NOMBRE_CATEGORIA[c]}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Fecha de publicación
            <input
              type="date"
              className={estiloCampo}
              value={fechaPublicacion}
              onChange={(e) => setFechaPublicacion(e.target.value)}
            />
          </label>
        </div>
        {!editando && !fechaPublicacion && (
          <p className="text-xs text-muted-foreground">Si la dejas vacía, al publicar se usa la fecha de hoy.</p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          URL de la imagen (opcional)
          <Input
            value={imagenUrl}
            placeholder="https://..."
            onChange={(e) => {
              setImagenUrl(e.target.value);
              setImagenRota(false);
            }}
          />
        </label>
        {imagenUrl.trim() !== '' && (
          imagenRota ? (
            <p className="text-xs text-red-600">No se pudo cargar la imagen de esa URL.</p>
          ) : (
            <img
              src={imagenUrl.trim()}
              alt="Vista previa"
              className="max-h-40 rounded-md border object-cover"
              onError={() => setImagenRota(true)}
            />
          )
        )}

        <label className="flex flex-col gap-1 text-sm">
          Contenido
          <textarea
            rows={8}
            className={`${estiloCampo} h-auto py-2`}
            placeholder="Escribe el contenido de la noticia..."
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Eliminar solo existe al editar, con confirmación en dos pasos */}
        <div>
          {editando && (confirmando ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm">¿Eliminar definitivamente?</span>
              <Button variant="destructive" size="sm" onClick={() => void eliminar()} disabled={guardando}>
                Sí, eliminar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmando(false)} disabled={guardando}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setConfirmando(true)} disabled={guardando}>
              <Trash2 /> Eliminar
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onCerrar} disabled={guardando}>Cancelar</Button>
          {editando ? (
            <Button onClick={() => void guardar(false)} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => void guardar(false)} disabled={guardando}>
                Guardar borrador
              </Button>
              <Button onClick={() => void guardar(true)} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Publicar'}
              </Button>
            </>
          )}
        </div>
      </DialogFooter>
    </>
  );
};

// ---------- Modal ----------

interface NoticiaDialogProps {
  abierto: boolean;
  // null = agregar una nueva; con noticia = modificarla
  noticia: Noticia | null;
  onCerrar: () => void;
  onGuardado: () => void;
  onEliminada: () => void;
}

export const NoticiaDialog = ({ abierto, noticia, onCerrar, onGuardado, onEliminada }: NoticiaDialogProps) => (
  <Dialog open={abierto} onOpenChange={(abrir: boolean) => { if (!abrir) onCerrar(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      {abierto && (
        <FormularioNoticia
          key={noticia?.idNoticia ?? 'nueva'}
          noticia={noticia}
          onCerrar={onCerrar}
          onGuardado={onGuardado}
          onEliminada={onEliminada}
        />
      )}
    </DialogContent>
  </Dialog>
);

export default NoticiaDialog;
